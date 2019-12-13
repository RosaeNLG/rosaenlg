import * as express from 'express';
import { RosaeContext } from './RosaeContext';
import * as fs from 'fs';
import { RenderedBundle } from './RenderedBundle';
import sha1 = require('sha1');
import NodeCache = require('node-cache');

export default class TemplatesController {
  public path = '/templates';

  private rosaeContexts = new Map<string, RosaeContext>();
  CACHE_STDTTL = 600; // 10 minutes
  CACHE_CHECKPERIOD = 60; // 1 minute
  private rosaeContextsTempCache = new NodeCache({
    stdTTL: this.CACHE_STDTTL,
    checkperiod: this.CACHE_CHECKPERIOD,
    useClones: false,
    deleteOnExpire: true,
  });

  public templatesPath: string | undefined;

  // eslint-disable-next-line new-cap
  public router = express.Router();

  constructor(templatesPath: string | undefined) {
    this.templatesPath = templatesPath;
    if (this.templatesPath) {
      console.log(`templatesPath is ${this.templatesPath}`);
    } else {
      console.log(`no templatesPath set`);
    }

    this.intializeRoutes();
  }

  public intializeRoutes(): void {
    this.router.get(this.path, this.listTemplates);

    this.router.get(`${this.path}/:templateId/template`, this.getTemplate);

    this.router.post(this.path, this.createTemplate).put(this.path, this.createTemplate);

    this.router.post(`${this.path}/render`, this.directRender);
    this.router.post(`${this.path}/:templateId/render`, this.renderTemplate);

    this.router.delete(`${this.path}/:templateId`, this.deleteTemplate);

    this.router.get(`${this.path}/reload`, this.reloadAllTemplates);
    this.router.get(`${this.path}/:templateId/reload`, this.reloadTemplate);
  }

  reloadAllTemplates = (request: express.Request, response: express.Response): void => {
    console.info(`reloading all templates...`);
    if (!this.templatesPath) {
      response.status(500).send(`no templates path, cannot reload!`);
    } else {
      // forget everything that was loaded
      this.rosaeContexts = new Map<string, RosaeContext>();

      const files = fs.readdirSync(this.templatesPath);
      for (let i = 0; i < files.length; i++) {
        const file: string = files[i];
        if (file.endsWith('.json')) {
          // avoid .gitkeep...
          try {
            const rawContent = fs.readFileSync(`${this.templatesPath}/${file}`, 'utf8');
            const rosaeContext: RosaeContext = new RosaeContext(JSON.parse(rawContent));
            this.rosaeContexts.set(rosaeContext.getTemplateId(), rosaeContext);
          } catch (e) {
            console.warn(`could not reload ${file}: ${e.message}`);
          }
        }
      }
      response.sendStatus(200);
    }
  };

  reloadTemplate = (request: express.Request, response: express.Response): void => {
    const templateId: string = request.params.templateId;

    console.info(`reloading specific template: ${templateId}...`);

    if (!this.templatesPath) {
      response.status(500).send(`no templates path, cannot reload!`);
      return;
    }

    let templateContent: string;
    try {
      templateContent = fs.readFileSync(`${this.templatesPath}/${templateId}.json`, 'utf8');
    } catch (e) {
      response.status(500).send(`could not read file`);
      return;
    }

    try {
      this.rosaeContexts.delete(templateId);
      const rosaeContext: RosaeContext = new RosaeContext(JSON.parse(templateContent));
      this.rosaeContexts.set(templateId, rosaeContext);
      response.sendStatus(200);
    } catch (e) {
      response.status(500).send(`could not load template ${e.message}`);
    }
  };

  deleteTemplate = (request: express.Request, response: express.Response): void => {
    const templateId: string = request.params.templateId;

    console.info(`deleting template: ${templateId}...`);

    const loadedExisted: boolean = this.rosaeContexts.delete(templateId);
    let fileExisted = false;
    if (this.templatesPath) {
      const fileToDelete = `${this.templatesPath}/${templateId}.json`;
      fileExisted = fs.existsSync(fileToDelete);
      fs.unlinkSync(fileToDelete);
    }

    if (!loadedExisted && !fileExisted) {
      response.status(500).send(`${templateId} does not exist`);
    } else {
      response.sendStatus(200);
    }
  };

  listTemplates = (request: express.Request, response: express.Response): void => {
    console.info(`listing templates...`);
    response.send({
      ids: Array.from(this.rosaeContexts.keys()),
      timestamp: new Date().toISOString(),
    });
  };

  getTemplate = (request: express.Request, response: express.Response): void => {
    const templateId: string = request.params.templateId;

    console.info(`get original package of a template: ${templateId}...`);

    const rosaeContext = this.rosaeContexts.get(templateId);
    if (!rosaeContext) {
      response.status(500).send(`${templateId} does not exist`);
    } else {
      response.send(rosaeContext.getPackagedTemplate());
    }
  };

  createTemplate = (request: express.Request, response: express.Response): void => {
    console.info(`creating or updating a template...`);
    const templateContent = request.body;
    let rosaeContext: RosaeContext;
    try {
      rosaeContext = new RosaeContext(templateContent);
    } catch (e) {
      response.status(500).send(`error creating template: ${e.message}`);
      return;
    }

    const templateId = rosaeContext.getTemplateId();
    if (!templateId) {
      response.status(500).send(`no templateId!`);
    } else {
      const status = this.rosaeContexts.has(templateId) ? 'UPDATED' : 'CREATED';

      if (this.templatesPath) {
        try {
          fs.writeFileSync(`${this.templatesPath}/${templateId}.tmp`, JSON.stringify(templateContent), 'utf8');
          fs.renameSync(`${this.templatesPath}/${templateId}.tmp`, `${this.templatesPath}/${templateId}.json`);
        } catch (e) {
          response.status(500).send(`could not save to disk!`);
          return;
        }
      }

      this.rosaeContexts.set(templateId, rosaeContext);

      response.send({
        templateId: templateId,
        status: status,
      });
    }
  };

  directRender = (request: express.Request, response: express.Response): void => {
    console.info(`direct rendering of a template...`);
    const requestContent = request.body;

    const template = requestContent.template;
    const data = requestContent.data;

    if (!template) {
      response.status(500).send(`no template`);
    }
    if (!data) {
      response.status(500).send(`no data`);
    }

    const templateId = sha1(JSON.stringify(template));
    // console.log(templateId);

    const alreadyHere = this.rosaeContextsTempCache.has(templateId);
    if (!alreadyHere) {
      template.templateId = templateId;
      try {
        const rosaeContext = new RosaeContext(template);
        this.rosaeContextsTempCache.set(templateId, rosaeContext);
      } catch (e) {
        response.status(500).send(`error creating template: ${e.message}`);
        return;
      }
    } else {
      // reset ttl
      this.rosaeContextsTempCache.ttl(templateId);
    }

    const rosaeContext: RosaeContext = this.rosaeContextsTempCache.get(templateId);
    try {
      const renderedBundle: RenderedBundle = rosaeContext.render(data);
      response.send({
        status: alreadyHere ? 'EXISTED' : 'CREATED',
        renderedText: renderedBundle.text,
        renderOptions: renderedBundle.renderOptions,
      });
    } catch (e) {
      response.status(500).send(`rendering error: ${e.toString()}`);
    }
  };

  renderTemplate = (request: express.Request, response: express.Response): void => {
    const templateId: string = request.params.templateId;

    console.info(`rendering a template: ${templateId}...`);

    const rosaeContext = this.rosaeContexts.get(templateId);
    if (!rosaeContext) {
      response.status(500).send(`${templateId} does not exist`);
    } else {
      try {
        const renderedBundle: RenderedBundle = rosaeContext.render(request.body);
        response.send({
          templateId: templateId,
          renderedText: renderedBundle.text,
          renderOptions: renderedBundle.renderOptions,
        });
      } catch (e) {
        response.status(500).send(`rendering error: ${e.toString()}`);
      }
    }
  };
}
