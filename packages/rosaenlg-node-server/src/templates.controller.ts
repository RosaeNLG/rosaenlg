import * as express from 'express';
import { RosaeContext } from './RosaeContext';
import * as fs from 'fs';
import { RenderedBundle } from './RenderedBundle';
import { RenderOptions } from './RenderOptions';
import sha1 from 'sha1';
import NodeCache = require('node-cache');
import winston = require('winston');
import { performance } from 'perf_hooks';
import aws = require('aws-sdk');
import uuidv4 from 'uuid/v4';

interface RenderResponseAbstract {
  renderedText: string;
  renderOptions: RenderOptions;
  ms: number;
}

interface DirectRenderResponse extends RenderResponseAbstract {
  status: 'EXISTED' | 'CREATED';
}

interface ClassicRenderResponse extends RenderResponseAbstract {
  templateId: string;
}

export default class TemplatesController {
  private readonly path = '/templates';

  private rosaeContexts = new Map<string, Map<string, RosaeContext>>();

  CACHE_STDTTL = 600; // 10 minutes
  CACHE_CHECKPERIOD = 60; // 1 minute
  private rosaeContextsTempCache = new NodeCache({
    stdTTL: this.CACHE_STDTTL,
    checkperiod: this.CACHE_CHECKPERIOD,
    useClones: false,
    deleteOnExpire: true,
  });

  private templatesPath: string | undefined;
  private s3: aws.S3;
  private s3bucketName: string | undefined;

  // eslint-disable-next-line new-cap
  public router = express.Router();

  private readonly defaultUser = 'DEFAULT_USER';
  private readonly userIdHeader = 'X-RapidAPI-User';
  private getUser(request: express.Request): string {
    return request.header(this.userIdHeader) || this.defaultUser;
  }

  private getFilename(user: string, templateId: string): string {
    return user + '_' + templateId + '.json';
  }

  private createTemplateFromJson(rawContent: string): void {
    const parsedContent = JSON.parse(rawContent);
    const userInFile = parsedContent.user;
    const rosaeContext: RosaeContext = new RosaeContext(parsedContent);

    if (!this.rosaeContexts.has(userInFile)) {
      this.rosaeContexts.set(userInFile, new Map<string, RosaeContext>());
    }
    this.rosaeContexts.get(userInFile).set(rosaeContext.getTemplateId(), rosaeContext);
  }

  private deleteAndReloadFromJson(user: string, templateId: string, rawContent: string): void {
    const rosaeContextsByUser = this.rosaeContexts.get(user);
    rosaeContextsByUser.delete(templateId);
    const rosaeContext: RosaeContext = new RosaeContext(JSON.parse(rawContent));
    rosaeContextsByUser.set(templateId, rosaeContext);
  }

  constructor(
    templatesPath: string | undefined,
    s3bucketName: string | undefined,
    s3accessKeyId: string | undefined,
    s3secretAccessKey: string | undefined,
    s3endpoint: string | undefined,
  ) {
    // if S3
    if (s3bucketName && s3accessKeyId && s3secretAccessKey) {
      this.s3bucketName = s3bucketName;
      const s3config: aws.S3.ClientConfiguration = {
        accessKeyId: s3accessKeyId,
        secretAccessKey: s3secretAccessKey,
        s3ForcePathStyle: true,
      };
      /* istanbul ignore next */
      if (s3endpoint) {
        s3config.endpoint = s3endpoint;
      }
      /* istanbul ignore next */
      winston.info(`trying to use s3 ${s3bucketName} on ${s3endpoint ? s3endpoint : 'default aws'}`);
      this.s3 = new aws.S3(s3config);
    } else {
      winston.info(`no s3 configured`);
    }

    // if disk
    this.templatesPath = templatesPath;

    // reload existing templates

    if (this.templatesPath) {
      winston.info(`templatesPath is ${this.templatesPath}; startup, reloading all templates from disk...`);

      const files = fs.readdirSync(this.templatesPath);
      for (let i = 0; i < files.length; i++) {
        const file: string = files[i];

        if (file.indexOf('_') > -1 && file.endsWith('.json')) {
          try {
            this.createTemplateFromJson(fs.readFileSync(`${this.templatesPath}/${file}`, 'utf8'));
            winston.info(`properly reloaded ${file}.`);
          } catch (e) {
            winston.warn(`could not reload ${file}: ${e}`);
          }
        }
      }
    } else if (this.s3) {
      winston.info(`s3 is ${this.s3bucketName}; startup, reloading all templates from disk...`);

      this.s3.listObjectsV2({ Bucket: this.s3bucketName }, (err, data) => {
        if (err) {
          winston.error(`s3 did not respond properly at startup: ${err}`);
        } else {
          /* istanbul ignore if */
          if (data.IsTruncated) {
            winston.error(`s3 response is truncated, not everything will be reloaded`);
          }
          for (let i = 0; i < data.Contents.length; i++) {
            const entryKey = data.Contents[i].Key;
            this.s3.getObject(
              {
                Bucket: this.s3bucketName,
                Key: entryKey,
              },
              (err, data) => {
                /* istanbul ignore if */
                if (err) {
                  winston.warn(`could not read ${entryKey} from s3 ${this.s3bucketName}: ${err}`);
                } else {
                  try {
                    this.createTemplateFromJson(data.Body.toString());
                    winston.info(`properly reloaded ${entryKey} from s3 ${this.s3bucketName}.`);
                  } catch (e) {
                    winston.warn(`could not reload ${entryKey} from s3 ${this.s3bucketName}: ${e}`);
                  }
                }
              },
            );
          }
        }
      });
    } else {
      winston.info(`no templatesPath and no S3 set`);
    }

    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.get(this.path, this.listTemplates);

    this.router.get(`${this.path}/:templateId`, this.getTemplate);

    this.router.get(`/health`, this.getHealth);

    this.router.post(this.path, this.createTemplate).put(this.path, this.createTemplate);

    this.router.post(`${this.path}/render`, this.directRender);
    this.router.post(`${this.path}/:templateId/render`, this.renderTemplate);

    this.router.delete(`${this.path}/:templateId`, this.deleteTemplate);

    this.router.put(`${this.path}/:templateId/reload`, this.reloadTemplate);
  }

  reloadTemplate = (request: express.Request, response: express.Response): void => {
    const templateId: string = request.params.templateId;
    const user = this.getUser(request);

    winston.info(`reloading specific template ${templateId} for ${user}...`);

    if (this.templatesPath) {
      const filename = this.getFilename(user, templateId);
      fs.readFile(`${this.templatesPath}/${filename}`, 'utf8', (err, templateContent) => {
        if (err) {
          winston.info(`template ${filename} does not exist on disk`);
          response.status(404).send(`template does not exist on disk`);
          return;
        } else {
          try {
            this.deleteAndReloadFromJson(user, templateId, templateContent);
            response.sendStatus(200);
            return;
          } catch (e) {
            winston.info(`could not load template ${e.message}`);
            response.status(400).send(`could not load template ${e.message}`);
            return;
          }
        }
      });
    } else if (this.s3) {
      const entryKey = this.getFilename(user, templateId);
      this.s3.getObject(
        {
          Bucket: this.s3bucketName,
          Key: entryKey,
        },
        (err, data) => {
          if (err) {
            winston.info(`template ${entryKey} does not exist on S3`);
            response.status(404).send(`template does not exist on S3`);
            return;
          } else {
            try {
              this.deleteAndReloadFromJson(user, templateId, data.Body.toString());
              response.sendStatus(200);
              return;
            } catch (e) {
              winston.info(`could not load template ${e.message}`);
              response.status(400).send(`could not load template ${e.message}`);
              return;
            }
          }
        },
      );
    } else {
      winston.info(`no templates path, cannot reload!`);
      response.status(400).send(`no templates path, cannot reload!`);
      return;
    }
  };

  deleteTemplate = (request: express.Request, response: express.Response): void => {
    const user = this.getUser(request);
    const templateId: string = request.params.templateId;

    winston.info(`deleting ${templateId} for ${user}...`);

    const rosaeContextsByUser = this.rosaeContexts.get(user);
    if (!rosaeContextsByUser) {
      response.status(404).send(`${templateId} does not exist`);
      return;
    } else {
      if (!rosaeContextsByUser.has(templateId)) {
        response.status(404).send(`${templateId} does not exist`);
        return;
      } else {
        // delete the loaded template
        rosaeContextsByUser.delete(templateId);

        if (this.templatesPath) {
          // delete the file
          const fileToDelete = `${this.templatesPath}/${this.getFilename(user, templateId)}`;
          fs.unlink(fileToDelete, err => {
            if (err) {
              winston.error(`${templateId} could not be deleted for ${user}: ${err}`);
              response.status(500).send(`${templateId} could not be deleted for ${user}`);
            } else {
              response.sendStatus(204);
              return;
            }
          });
        } else if (this.s3) {
          this.s3.deleteObject({ Bucket: this.s3bucketName, Key: this.getFilename(user, templateId) }, err => {
            /* istanbul ignore if */
            if (err) {
              winston.error(`${templateId} could not be deleted for ${user} on S3 ${this.s3bucketName}`);
              response.status(500).send(`${templateId} could not be deleted for ${user} on S3`);
            } else {
              response.sendStatus(204);
              return;
            }
          });
        } else {
          response.sendStatus(204);
        }
      }
    }
  };

  listTemplates = (request: express.Request, response: express.Response): void => {
    const user = this.getUser(request);
    winston.info(`listing templates for ${user}...`);
    const rosaeContextsByUser = this.rosaeContexts.get(user);
    let ids: Array<string>;
    if (!rosaeContextsByUser) {
      ids = [];
    } else {
      ids = Array.from(rosaeContextsByUser.keys());
    }
    response.send({
      ids: ids,
      timestamp: new Date().toISOString(),
    });
  };

  getHealth = (request: express.Request, response: express.Response): void => {
    const filename = `${this.templatesPath}/health_${uuidv4()}.tmp`;
    const content = 'health check';
    if (this.templatesPath) {
      fs.writeFile(filename, content, 'utf8', err => {
        if (err) {
          winston.error('health failed, could not save to disk');
          response.status(503).send(`could not save to disk!`);
        } else {
          fs.unlink(filename, () => {
            response.sendStatus(200);
            return;
          });
        }
      });
    } else if (this.s3) {
      this.s3.upload(
        {
          Bucket: this.s3bucketName,
          Key: filename,
          Body: JSON.stringify(content),
        },
        err => {
          if (err) {
            winston.error(`health failed, could not save to s3 ${err}`);
            response.status(503).send(`could not save to s3!`);
          } else {
            this.s3.deleteObject({ Bucket: this.s3bucketName, Key: filename }, () => {
              response.sendStatus(200);
              return;
            });
          }
        },
      );
    } else {
      // nothing to test
      response.sendStatus(200);
    }
  };

  getTemplate = (request: express.Request, response: express.Response): void => {
    const user = this.getUser(request);
    const templateId: string = request.params.templateId;

    winston.info(`get original package of ${templateId} for ${user}...`);

    const rosaeContext = this.getContext(user, templateId);
    if (!rosaeContext) {
      response.status(404).send(`${templateId} does not exist`);
      return;
    } else {
      response.send(rosaeContext.getPackagedTemplate());
      return;
    }
  };

  createTemplate = (request: express.Request, response: express.Response): void => {
    const start = performance.now();
    const user = this.getUser(request);
    winston.info(`creating or updating a template for ${user}...`);

    const templateContent = request.body;

    // we have to save it for persistency and reload
    templateContent.user = user;

    let rosaeContext: RosaeContext;
    try {
      rosaeContext = new RosaeContext(templateContent);
    } catch (e) {
      response.status(400).send(`error creating template: ${e.message}`);
      return;
    }

    const templateId = rosaeContext.getTemplateId();
    if (!templateId) {
      response.status(400).send(`no templateId!`);
      return;
    } else {
      if (!this.rosaeContexts.has(user)) {
        this.rosaeContexts.set(user, new Map<string, RosaeContext>());
      }
      const rosaeContextsByUser = this.rosaeContexts.get(user);
      const status = rosaeContextsByUser.has(templateId) ? 'UPDATED' : 'CREATED';
      if (this.templatesPath) {
        fs.writeFile(
          `${this.templatesPath}/${this.getFilename(user, templateId)}`,
          JSON.stringify(templateContent),
          'utf8',
          err => {
            if (err) {
              winston.error('could not save to disk');
              response.status(500).send(`could not save to disk!`);
              return;
            } else {
              rosaeContextsByUser.set(templateId, rosaeContext);
              const ms = performance.now() - start;
              response.status(201).send({
                templateId: templateId,
                status: status,
                ms: ms,
              });
              winston.info(`${templateId} was ${status} for ${user}, ${Math.round(ms)} ms`);
              return;
            }
          },
        );
      } else if (this.s3) {
        this.s3.upload(
          {
            Bucket: this.s3bucketName,
            Key: this.getFilename(user, templateId),
            Body: JSON.stringify(templateContent),
          },
          (err, data) => {
            if (err) {
              winston.error(`could not save to s3 ${err}`);
              response.status(500).send(`could not save to s3!`);
            } else {
              rosaeContextsByUser.set(templateId, rosaeContext);
              const ms = performance.now() - start;
              response.status(201).send({
                templateId: templateId,
                status: status,
                ms: ms,
              });
              winston.info(`file uploaded successfully at ${data.Location}`);
              return;
            }
          },
        );
      } else {
        rosaeContextsByUser.set(templateId, rosaeContext);
        const ms = performance.now() - start;
        response.status(201).send({
          templateId: templateId,
          status: status,
          ms: ms,
        });
        winston.info(`${templateId} was ${status} for ${user}, ${Math.round(ms)} ms`);
        return;
      }
    }
  };

  directRender = (request: express.Request, response: express.Response): void => {
    const user = this.getUser(request);
    const start = performance.now();
    winston.info(`direct rendering of a template...`);

    const requestContent = request.body;

    const template = requestContent.template;
    const data = requestContent.data;

    if (!template) {
      response.status(400).send(`no template`);
      return;
    }
    if (!data) {
      response.status(400).send(`no data`);
      return;
    }

    const templateId = sha1(JSON.stringify(template));
    const key = templateId; // no need to put user here

    const alreadyHere = this.rosaeContextsTempCache.has(key);
    if (!alreadyHere) {
      template.templateId = templateId;
      template.user = user;
      try {
        const rosaeContext = new RosaeContext(template);
        this.rosaeContextsTempCache.set(key, rosaeContext);
      } catch (e) {
        response.status(400).send(`error creating template: ${e.message}`);
        return;
      }
    } else {
      // reset ttl
      this.rosaeContextsTempCache.ttl(key);
    }

    const rosaeContext: RosaeContext = this.rosaeContextsTempCache.get(key);
    try {
      const renderedBundle: RenderedBundle = rosaeContext.render(data);
      const status = alreadyHere ? 'EXISTED' : 'CREATED';
      const ms = performance.now() - start;
      response.status(200).send({
        status: status,
        renderedText: renderedBundle.text,
        renderOptions: renderedBundle.renderOptions,
        ms: ms,
      } as DirectRenderResponse);
      winston.info(`${key}: ${status} for ${user}, then rendered, ${Math.round(ms)} ms`);
    } catch (e) {
      response.status(400).send(`rendering error: ${e.toString()}`);
      return;
    }
  };

  private getContext(user: string, templateId: string): RosaeContext {
    const rosaeContextByUser = this.rosaeContexts.get(user);
    if (rosaeContextByUser) {
      return rosaeContextByUser.get(templateId);
    }
    return null;
  }

  renderTemplate = (request: express.Request, response: express.Response): void => {
    const start = performance.now();

    const templateId: string = request.params.templateId;
    const user = this.getUser(request);

    winston.info(`rendering a template: ${templateId} for ${user}...`);

    const rosaeContext = this.getContext(user, templateId);
    if (!rosaeContext) {
      response.status(404).send(`${templateId} does not exist for ${user}`);
      return;
    } else {
      try {
        const renderedBundle: RenderedBundle = rosaeContext.render(request.body);
        const ms = performance.now() - start;
        response.status(200).send({
          templateId: templateId,
          renderedText: renderedBundle.text,
          renderOptions: renderedBundle.renderOptions,
          ms: ms,
        } as ClassicRenderResponse);
        winston.info(`${templateId} was rendered for ${user}, ${Math.round(ms)} ms`);
      } catch (e) {
        response.status(400).send(`rendering error: ${e.toString()}`);
        return;
      }
    }
  };
}
