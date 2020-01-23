import * as express from 'express';
import { RosaeContext } from './RosaeContext';
import * as fs from 'fs';
import { RenderedBundle } from './RenderedBundle';
import { RenderOptions } from './RenderOptions';
import sha1 from 'sha1';
import winston = require('winston');
import { performance } from 'perf_hooks';
import aws = require('aws-sdk');
import uuidv4 from 'uuid/v4';
import CloudWatchTransport = require('winston-aws-cloudwatch');
import { RosaeContextsManager, CacheValue } from './RosaeContextsManager';

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

interface UserAndTemplateId {
  user: string;
  templateId: string;
}

export interface ServerParams {
  templatesPath: string | undefined;
  s3: {
    bucketName: string | undefined;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    endpoint: string | undefined;
  };
  cloudwatch: {
    logGroupName: string | undefined;
    logStreamName: string | undefined;
    accessKeyId: string | undefined;
    secretAccessKey: string | undefined;
    region: string | undefined;
  };
  behavior: {
    lazyStartup: boolean;
    forgetTemplates: boolean;
    cacheTtl?: number;
    checkPeriod?: number;
  };
}

export default class TemplatesController {
  private readonly path = '/templates';

  private rosaeContextsManager: RosaeContextsManager;

  private templatesPath: string | undefined;
  private s3: aws.S3;
  private s3bucketName: string | undefined;
  private logBackendName: 'disk' | 's3';

  // eslint-disable-next-line new-cap
  public router = express.Router();

  private readonly defaultUser = 'DEFAULT_USER';
  private readonly userIdHeader = 'X-RapidAPI-User';
  private getUser(request: express.Request): string {
    const user = request.header(this.userIdHeader);
    if (!user) {
      return this.defaultUser;
    } else {
      if (user.indexOf('#') > -1) {
        const err = new Error();
        err.message = `# is not allowed in user name`;
        throw err;
      } else {
        return user;
      }
    }
  }

  private getFilename(user: string, templateId: string): string {
    return user + '#' + templateId + '.json';
  }

  private hasBackend(): boolean {
    if (this.templatesPath != null || this.s3 != null) {
      return true;
    } else {
      return false;
    }
  }
  private loadAndGetFromRawJson(rawContent: string): CacheValue {
    const parsedContent = JSON.parse(rawContent);
    const user = parsedContent.user;
    const templateId = parsedContent.templateId;

    const cacheValue: CacheValue = {
      templateSha1: sha1(rawContent),
      rosaeContext: new RosaeContext(parsedContent),
    };

    this.rosaeContextsManager.setInCache(user, templateId, cacheValue, false);

    return cacheValue;
  }

  initializeRoutes(): void {
    this.router.get(this.path, this.listTemplates);

    this.router.get(`${this.path}/:templateId`, this.getTemplate);

    this.router.get(`/health`, this.getHealth);

    this.router.post(this.path, this.createTemplate).put(this.path, this.createTemplate);
    this.router.post(`${this.path}/render`, this.directRender);
    this.router.post(`${this.path}/:templateId/:templateSha1/render`, this.renderTemplate);

    this.router.delete(`${this.path}/:templateId`, this.deleteTemplate);

    this.router.put(`${this.path}/:templateId/reload`, this.reloadTemplate);
  }

  constructor(serverParams: ServerParams) {
    // cloudwatch logging. todo first to get logs asap
    /* istanbul ignore next */
    if (
      serverParams &&
      serverParams.cloudwatch &&
      serverParams.cloudwatch.logGroupName &&
      serverParams.cloudwatch.accessKeyId &&
      serverParams.cloudwatch.secretAccessKey
    ) {
      winston.info({ action: 'startup', message: `starting to configure cloudwatch logging...` });
      const cwt = new CloudWatchTransport({
        logGroupName: serverParams.cloudwatch.logGroupName,
        logStreamName: serverParams.cloudwatch.logStreamName,
        createLogGroup: false,
        createLogStream: false,
        submissionInterval: 2000,
        submissionRetryCount: 1,
        batchSize: 20,
        awsConfig: {
          accessKeyId: serverParams.cloudwatch.accessKeyId,
          secretAccessKey: serverParams.cloudwatch.secretAccessKey,
          region: serverParams.cloudwatch.region,
        },
        //formatLog: item => `${item.level}: ${item.message}`,
      });
      winston.add(cwt);
    }

    // if S3
    if (serverParams && serverParams.s3 && serverParams.s3.bucketName) {
      this.logBackendName = 's3';
      this.s3bucketName = serverParams.s3.bucketName;
      const s3config: aws.S3.ClientConfiguration = {
        accessKeyId: serverParams.s3.accessKeyId,
        secretAccessKey: serverParams.s3.secretAccessKey,
        s3ForcePathStyle: true,
      };
      /* istanbul ignore next */
      if (serverParams.s3.endpoint) {
        s3config.endpoint = serverParams.s3.endpoint;
      }
      /* istanbul ignore next */
      winston.info({
        action: 'startup',
        storage: 's3', // to early to use the generic function
        message: `trying to use s3 ${serverParams.s3.bucketName} on ${
          serverParams.s3.endpoint ? serverParams.s3.endpoint : 'default aws'
        }`,
      });
      this.s3 = new aws.S3(s3config);
    } else {
      winston.info({
        action: 'startup',
        message: 'no s3 configured',
      });
    }

    // if disk
    if (serverParams && serverParams.templatesPath) {
      this.logBackendName = 'disk';
      this.templatesPath = serverParams.templatesPath;
    }

    // forget templates
    let forgetTemplates = false;
    if (serverParams && serverParams.behavior && serverParams.behavior.forgetTemplates) {
      if (!this.hasBackend()) {
        winston.error({
          action: 'startup',
          message: 'asked to forget templates, but no backend: parameter is ignored',
        });
      } else {
        forgetTemplates = true;
      }
    }

    // specific ttl and checkPeriod for tests purposes
    let ttl: number = null;
    if (serverParams && serverParams.behavior && serverParams.behavior.cacheTtl) {
      ttl = serverParams.behavior.cacheTtl;
      winston.info({
        action: 'startup',
        message: `using specific ttl: ${ttl}`,
      });
    }
    let checkPeriod: number = null;
    if (serverParams && serverParams.behavior && serverParams.behavior.checkPeriod) {
      checkPeriod = serverParams.behavior.checkPeriod;
      winston.info({
        action: 'startup',
        message: `using specific check period: ${checkPeriod}`,
      });
    }

    this.rosaeContextsManager = new RosaeContextsManager(forgetTemplates, ttl, checkPeriod);

    // reload existing templates

    if (serverParams && serverParams.behavior && serverParams.behavior.lazyStartup) {
      winston.info({
        action: 'startup',
        message: `lazy startup: we don't reload`,
      });
    } else {
      if (this.templatesPath) {
        winston.info({
          action: 'startup',
          storage: this.logBackendName,
          message: `templatesPath is ${this.templatesPath}; reloading all templates from disk...`,
        });
        this.getAllFiles(files => {
          for (let i = 0; i < files.length; i++) {
            const file: string = files[i];

            const userAndTemplateId = this.getUserAndTemplateId(file);
            if (userAndTemplateId && userAndTemplateId.user && userAndTemplateId.templateId) {
              fs.readFile(`${this.templatesPath}/${file}`, 'utf8', (err, data) => {
                /* istanbul ignore if */
                if (err) {
                  winston.warn({
                    action: 'startup',
                    storage: this.logBackendName,
                    message: `could not reload ${file}: ${err}`,
                  });
                } else {
                  try {
                    this.loadAndGetFromRawJson(data);
                    winston.info({
                      action: 'startup',
                      storage: this.logBackendName,
                      message: `properly reloaded ${file}`,
                    });
                  } catch (e) {
                    winston.warn({
                      action: 'startup',
                      storage: this.logBackendName,
                      message: `could not reload ${file}: ${e}`,
                    });
                  }
                }
              });
            } else {
              winston.warn({
                action: 'startup',
                storage: this.logBackendName,
                message: `invalid file: ${file}`,
              });
            }
          }
        });
      } else if (this.s3) {
        winston.info({
          action: 'startup',
          storage: this.logBackendName,
          message: `s3 is ${this.s3bucketName}; startup, reloading all templates...`,
        });
        this.getAllFiles(files => {
          for (let i = 0; i < files.length; i++) {
            const entryKey = files[i];
            this.s3.getObject(
              {
                Bucket: this.s3bucketName,
                Key: entryKey,
              },
              (err, data) => {
                /* istanbul ignore if */
                if (err) {
                  winston.warn({
                    action: 'startup',
                    storage: this.logBackendName,
                    message: `could not read ${entryKey} from s3 ${this.s3bucketName}: ${err}`,
                  });
                } else {
                  const userAndTemplateId = this.getUserAndTemplateId(entryKey);
                  if (userAndTemplateId && userAndTemplateId.user && userAndTemplateId.templateId) {
                    try {
                      this.loadAndGetFromRawJson(data.Body.toString());
                      winston.info({
                        action: 'startup',
                        storage: this.logBackendName,
                        message: `properly reloaded ${entryKey} from s3 ${this.s3bucketName}`,
                      });
                    } catch (e) {
                      winston.warn({
                        action: 'startup',
                        storage: this.logBackendName,
                        message: `could not reload ${entryKey} from s3 ${this.s3bucketName}: ${e}`,
                      });
                    }
                  } else {
                    winston.warn({
                      action: 'startup',
                      storage: this.logBackendName,
                      message: `invalid file: ${entryKey}`,
                    });
                  }
                }
              },
            );
          }
        });
      } else {
        winston.info({ action: 'startup', message: `no templatesPath and no S3 set` });
      }
    }

    this.initializeRoutes();
  }

  reloadTemplate = (request: express.Request, response: express.Response): void => {
    const start = performance.now();
    const templateId: string = request.params.templateId;
    let user: string;
    try {
      user = this.getUser(request);
    } catch (err) {
      response.status(400).send(`invalid user name: contains #`);
      return;
    }

    winston.info({ user: user, templateId: templateId, action: 'reload', message: `start...` });

    if (this.hasBackend()) {
      this.getContextOrLoadIt(user, templateId, null, (cacheValue: CacheValue) => {
        if (!cacheValue) {
          response.status(404).send(`template does not exist, or invalid template`);
          return;
        } else {
          const ms = performance.now() - start;
          response.status(200).send({
            templateId: templateId,
            templateSha1: cacheValue.templateSha1,
            ms: ms,
          });
          return;
        }
      });
    } else {
      winston.info({
        user: user,
        templateId: templateId,
        action: 'reload',
        message: `no storage backend, cannot reload!`,
      });
      response.status(400).send(`no storage backend, cannot reload!`);
      return;
    }
  };

  deleteInBackend = (user: string, templateId: string, cb: (err: string, deletedInBackend: boolean) => void): void => {
    if (this.templatesPath) {
      // delete the file
      const fileToDelete = `${this.templatesPath}/${this.getFilename(user, templateId)}`;
      fs.unlink(fileToDelete, err => {
        if (err) {
          cb(err.message, false);
        } else {
          cb(null, true);
        }
      });
    } else if (this.s3) {
      this.s3.deleteObject({ Bucket: this.s3bucketName, Key: this.getFilename(user, templateId) }, err => {
        /* istanbul ignore if */
        if (err) {
          cb(`${err.code} ${err.message}`, false);
        } else {
          cb(null, true);
        }
      });
    } else {
      cb(null, false);
    }
  };

  deleteTemplate = (request: express.Request, response: express.Response): void => {
    let user: string;
    try {
      user = this.getUser(request);
    } catch (err) {
      response.status(400).send(`invalid user name: contains #`);
      return;
    }
    const templateId: string = request.params.templateId;

    winston.info({ user: user, templateId: templateId, action: 'delete', message: `start delete...` });

    let deletedInMem = false;
    if (this.rosaeContextsManager.isInCache(user, templateId)) {
      // delete the loaded template
      this.rosaeContextsManager.deleteFromCache(user, templateId);
      deletedInMem = true;
    }
    this.deleteInBackend(user, templateId, (err: string, deletedInBackend: boolean) => {
      if (deletedInMem || deletedInBackend) {
        response.sendStatus(204);
        return;
      } else {
        response.sendStatus(404);
        return;
      }
    });
  };

  private getUserAndTemplateId(filename: string): UserAndTemplateId {
    const fileRe = new RegExp('^([^#]*)#([^\\.]*)\\.json$');
    const matches = filename.match(fileRe);
    if (matches && matches.length == 3) {
      return {
        user: matches[1],
        templateId: matches[2],
      };
    } else {
      return null;
    }
  }

  private getAllFiles(cb: (files: string[]) => void): void {
    /* istanbul ignore else */
    if (this.templatesPath) {
      fs.readdir(this.templatesPath, (err, files) => {
        if (err) {
          winston.error({
            storage: this.logBackendName,
            message: `cannot read backend: ${err}`,
          });
          cb([]);
        } else {
          cb(files);
        }
      });
    } else if (this.s3) {
      this.s3.listObjectsV2({ Bucket: this.s3bucketName }, (err, data) => {
        if (err) {
          winston.error({
            storage: this.logBackendName,
            message: `s3 did not respond properly: ${err}`,
          });
          cb([]);
        } else {
          /* istanbul ignore if */
          if (data.IsTruncated) {
            winston.error({
              storage: this.logBackendName,
              message: `s3 response is truncated, not everything will be reloaded`,
            });
            cb([]);
          } else {
            const files: string[] = [];
            for (let i = 0; i < data.Contents.length; i++) {
              files.push(data.Contents[i].Key);
            }
            cb(files);
          }
        }
      });
    } else {
      const err = new Error();
      err.message = `getAllFiles called without backend`;
      throw err;
    }
  }

  listTemplates = (request: express.Request, response: express.Response): void => {
    let user: string;
    try {
      user = this.getUser(request);
    } catch (err) {
      response.status(400).send(`invalid user name: contains #`);
      return;
    }
    winston.info({ user: user, action: 'list' });

    if (this.hasBackend()) {
      this.getAllFiles(files => {
        const ids: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file: string = files[i];
          const userAndTemplateId = this.getUserAndTemplateId(file);
          if (userAndTemplateId && userAndTemplateId.user == user && userAndTemplateId.templateId) {
            ids.push(userAndTemplateId.templateId);
          }
        }
        winston.info({ user: user, action: 'list', message: `templates: ${ids}` });
        response.status(200).send({
          ids: ids,
        });
        return;
      });
    } else {
      // just what we have in cache
      const ids = this.rosaeContextsManager.getIds(user);
      winston.info({ user: user, action: 'list', message: `templates: ${ids}` });
      response.status(200).send({
        ids: ids,
      });
      return;
    }
  };

  getHealth = (request: express.Request, response: express.Response): void => {
    const filename = `${this.templatesPath}/health_${uuidv4()}.tmp`;
    const content = 'health check';
    if (this.templatesPath) {
      fs.writeFile(filename, content, 'utf8', err => {
        if (err) {
          winston.error({
            action: 'health',
            storage: this.logBackendName,
            message: `health failed, could not save to disk: ${err}`,
          });
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
            winston.error({
              action: 'health',
              storage: this.logBackendName,
              message: `health failed, could not save to S3: ${err}`,
            });
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
    let user: string;
    try {
      user = this.getUser(request);
    } catch (err) {
      response.status(400).send(`invalid user name: contains #`);
      return;
    }
    const templateId: string = request.params.templateId;

    winston.info({ user: user, templateId: templateId, action: 'get', message: `get original package` });

    this.getContextOrLoadIt(user, templateId, null, (cacheValue: CacheValue) => {
      if (!cacheValue) {
        response.status(404).send(`${templateId} does not exist`);
        winston.info({ user: user, templateId: templateId, action: 'get', message: `does not exist` });
        return;
      } else {
        response.status(200).send({
          templateId: templateId,
          templateSha1: cacheValue.templateSha1,
          templateContent: cacheValue.rosaeContext.getPackagedTemplate(),
        });
        return;
      }
    });
  };

  createTemplate = (request: express.Request, response: express.Response): void => {
    const start = performance.now();
    let user: string;
    try {
      user = this.getUser(request);
    } catch (err) {
      response.status(400).send(`invalid user name: contains #`);
      return;
    }
    winston.info({ user: user, action: 'create', message: `creating or updating a template` });

    const templateContent = request.body;

    // we have to save it for persistency and reload
    templateContent.user = user;
    const templateSha1 = sha1(JSON.stringify(templateContent));

    let rosaeContext: RosaeContext;
    try {
      rosaeContext = new RosaeContext(templateContent);
    } catch (e) {
      response.status(400).send(`error creating template: ${e.message}`);
      winston.info({
        user: user,
        action: 'create',
        sha1: templateSha1,
        message: `error creating template: ${e.message}`,
      });
      return;
    }

    const templateId = rosaeContext.getTemplateId();
    if (!templateId) {
      response.status(400).send(`no templateId!`);
      winston.info({ user: user, action: 'create', sha1: templateSha1, message: `no templateId` });
      return;
    } else {
      const cacheValue: CacheValue = {
        templateSha1: templateSha1,
        rosaeContext: rosaeContext,
      };
      if (this.templatesPath) {
        fs.writeFile(
          `${this.templatesPath}/${this.getFilename(user, templateId)}`,
          JSON.stringify(templateContent),
          'utf8',
          err => {
            if (err) {
              winston.error({
                user: user,
                action: 'create',
                sha1: templateSha1,
                storage: this.logBackendName,
                message: `could not save to disk: ${err}`,
              });
              response.status(500).send(`could not save to disk!`);
              return;
            } else {
              this.rosaeContextsManager.setInCache(user, templateId, cacheValue, false);
              const ms = performance.now() - start;
              response.status(201).send({
                templateId: templateId,
                templateSha1: templateSha1,
                ms: ms,
              });
              winston.info({
                user: user,
                templateId: templateId,
                action: 'create',
                sha1: templateSha1,
                ms: Math.round(ms),
                message: `created`,
              });
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
              winston.error({
                user: user,
                action: 'create',
                sha1: templateSha1,
                storage: this.logBackendName,
                message: `could not save to s3: ${err}`,
              });
              response.status(500).send(`could not save to s3!`);
            } else {
              this.rosaeContextsManager.setInCache(user, templateId, cacheValue, false);
              const ms = performance.now() - start;
              response.status(201).send({
                templateId: templateId,
                templateSha1: templateSha1,
                ms: ms,
              });
              winston.info({
                user: user,
                action: 'create',
                sha1: templateSha1,
                storage: this.logBackendName,
                message: `saved to s3 ${data.Location}`,
              });
              return;
            }
          },
        );
      } else {
        this.rosaeContextsManager.setInCache(user, templateId, cacheValue, false);
        // winston.info(`now in the cache: ${this.rosaeContexts.size}`);
        const ms = performance.now() - start;
        response.status(201).send({
          templateId: templateId,
          templateSha1: templateSha1,
          ms: ms,
        });
        winston.info({
          user: user,
          templateId: templateId,
          action: 'create',
          sha1: templateSha1,
          ms: Math.round(ms),
          message: `created`,
        });
        return;
      }
    }
  };

  directRender = (request: express.Request, response: express.Response): void => {
    let user: string;
    try {
      user = this.getUser(request);
    } catch (err) {
      response.status(400).send(`invalid user name: contains #`);
      return;
    }
    const start = performance.now();
    winston.info({ user: user, action: 'directRender', message: `direct rendering of a template...` });

    const requestContent = request.body;

    const template = requestContent.template;
    const data = requestContent.data;

    if (!template) {
      response.status(400).send(`no template`);
      winston.info({
        user: user,
        action: 'directRender',
        message: `no template`,
      });
      return;
    }
    if (!data) {
      response.status(400).send(`no data`);
      winston.info({
        user: user,
        action: 'directRender',
        message: `no data`,
      });
      return;
    }

    const templateSha1 = sha1(JSON.stringify(template));

    const alreadyHere = this.rosaeContextsManager.isInCache(user, templateSha1);
    if (!alreadyHere) {
      template.templateId = templateSha1;
      template.user = user;
      try {
        this.rosaeContextsManager.setInCache(
          user,
          templateSha1,
          {
            templateSha1: templateSha1,
            rosaeContext: new RosaeContext(template),
          },
          true,
        );
      } catch (e) {
        response.status(400).send(`error creating template: ${e.message}`);
        winston.info({
          user: user,
          action: 'directRender',
          message: `error creating template: ${e.message}`,
        });
        return;
      }
    }

    const rosaeContext: RosaeContext = this.rosaeContextsManager.getFromCache(user, templateSha1).rosaeContext;
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
      winston.info({
        user: user,
        action: 'directRender',
        ms: Math.round(ms),
        message: `rendered ${templateSha1}, ${status}`,
      });
    } catch (e) {
      response.status(400).send(`rendering error: ${e.toString()}`);
      winston.info({
        user: user,
        action: 'directRender',
        message: `rendering error: ${e.toString()}`,
      });
      return;
    }
  };

  // templateSha1 can be null to force reload
  private getContextOrLoadIt(
    user: string,
    templateId: string,
    templateSha1: string | undefined,
    done: (cacheValue: CacheValue) => void,
  ): void {
    if (
      // already in cache with the proper sha1?
      templateSha1 &&
      this.rosaeContextsManager.isInCache(user, templateId) &&
      this.rosaeContextsManager.getFromCache(user, templateId).templateSha1 == templateSha1
    ) {
      done(this.rosaeContextsManager.getFromCache(user, templateId));
    } else {
      if (this.hasBackend()) {
        /* istanbul ignore else */
        if (this.templatesPath) {
          const filename = this.getFilename(user, templateId);
          // winston.info('will try to read' + filename);
          fs.readFile(`${this.templatesPath}/${filename}`, 'utf8', (err, templateContent) => {
            if (err) {
              // does not exist: we don't care, don't even log
              done(null);
            } else {
              // winston.info('read ok ' + templateContent);
              try {
                // do in 2 separate steps to let the exception trigger
                const cacheValue = this.loadAndGetFromRawJson(templateContent);
                if (!templateSha1 || cacheValue.templateSha1 == templateSha1) {
                  done(cacheValue);
                } else {
                  done(null);
                }
              } catch (e) {
                winston.info({
                  user: user,
                  templateId: templateId,
                  templateSha1: templateSha1,
                  action: 'load',
                  storage: this.logBackendName,
                  message: `could not load template ${e.message}`,
                });
                done(null);
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
                // does not exist: we don't care, don't even log
                done(null);
              } else {
                try {
                  // do in 2 separate steps to let the exception trigger
                  const cacheValue = this.loadAndGetFromRawJson(data.Body.toString());
                  if (!templateSha1 || cacheValue.templateSha1 == templateSha1) {
                    done(cacheValue);
                  } else {
                    done(null);
                  }
                } catch (e) {
                  /* istanbul ignore next */
                  winston.info({
                    user: user,
                    templateId: templateId,
                    templateSha1: templateSha1,
                    storage: this.logBackendName,
                    action: 'load',
                    message: `could not load template ${e.message}`,
                  });
                  /* istanbul ignore next */
                  done(null);
                }
              }
            },
          );
        }
      } else {
        if (
          // no sha1 provided, but no backend: we give what we have, for getTemplate
          !templateSha1
        ) {
          done(this.rosaeContextsManager.getFromCache(user, templateId));
        } else {
          done(null);
        }
      }
    }
  }

  renderTemplate = (request: express.Request, response: express.Response): void => {
    const start = performance.now();

    const templateId: string = request.params.templateId;
    const templateSha1: string = request.params.templateSha1;
    let user: string;
    try {
      user = this.getUser(request);
    } catch (err) {
      response.status(400).send(`invalid user name: contains #`);
      return;
    }

    winston.info({
      user: user,
      templateId: templateId,
      sha1: templateSha1,
      action: 'render',
      message: `start rendering a template...`,
    });

    this.getContextOrLoadIt(user, templateId, templateSha1, (cacheValue: CacheValue) => {
      if (!cacheValue) {
        response.status(404).send(`${templateId} does not exist for ${user}`);
        winston.info({ user: user, templateId: templateId, action: 'render', message: `template does not exist` });
        return;
      } else {
        try {
          const renderedBundle: RenderedBundle = cacheValue.rosaeContext.render(request.body);
          const ms = performance.now() - start;
          response.status(200).send({
            renderedText: renderedBundle.text,
            renderOptions: renderedBundle.renderOptions,
            ms: ms,
          } as ClassicRenderResponse);
          winston.info({
            user: user,
            templateId: templateId,
            sha1: templateSha1,
            action: 'render',
            ms: Math.round(ms),
            message: `done`,
          });
        } catch (e) {
          response.status(400).send(`rendering error: ${e.toString()}`);
          winston.info({
            user: user,
            templateId: templateId,
            sha1: templateSha1,
            action: 'render',
            message: `rendering error: ${e.toString()}`,
          });
          return;
        }
      }
    });
  };
}
