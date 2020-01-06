import * as express from 'express';
import { RosaeContext } from './RosaeContext';
import * as fs from 'fs';
import { RenderedBundle } from './RenderedBundle';
import sha1 from 'sha1';
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
      this.loadTemplatesFromDisk();
    } else {
      console.log(`no templatesPath set`);
    }

    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.get(this.path, this.listTemplates);

    this.router.get(`${this.path}/:templateId/template`, this.getTemplate);

    this.router.post(this.path, this.createTemplate).put(this.path, this.createTemplate);

    this.router.post(`${this.path}/render`, this.directRender);
    this.router.post(`${this.path}/:templateId/render`, this.renderTemplate);

    this.router.delete(`${this.path}/:templateId`, this.deleteTemplate);

    this.router.put(`${this.path}/reload`, this.reloadAllTemplates);
    this.router.put(`${this.path}/:templateId/reload`, this.reloadTemplate);
  }

  private loadTemplatesFromDisk = (): void => {
    console.info(`startup, reloading all templates from disk...`);
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
  };

  reloadAllTemplates = (request: express.Request, response: express.Response): void => {
    console.info(`reloading all templates...`);
    if (!this.templatesPath) {
      response.status(400).send(`no templates path, cannot reload!`);
      return;
    } else {
      // forget everything that was loaded
      this.rosaeContexts = new Map<string, RosaeContext>();

      this.loadTemplatesFromDisk();

      response.sendStatus(200);
    }
  };

  reloadTemplate = (request: express.Request, response: express.Response): void => {
    const templateId: string = request.params.templateId;

    console.info(`reloading specific template: ${templateId}...`);

    if (!this.templatesPath) {
      response.status(400).send(`no templates path, cannot reload!`);
      return;
    }

    let templateContent: string;
    try {
      templateContent = fs.readFileSync(`${this.templatesPath}/${templateId}.json`, 'utf8');
    } catch (e) {
      response.status(404).send(`template does not exist on disk`);
      return;
    }

    try {
      this.rosaeContexts.delete(templateId);
      const rosaeContext: RosaeContext = new RosaeContext(JSON.parse(templateContent));
      this.rosaeContexts.set(templateId, rosaeContext);
      response.sendStatus(200);
      return;
    } catch (e) {
      response.status(400).send(`could not load template ${e.message}`);
      return;
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
      response.status(404).send(`${templateId} does not exist`);
      return;
    } else {
      response.sendStatus(204);
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
      response.status(404).send(`${templateId} does not exist`);
      return;
    } else {
      response.send(rosaeContext.getPackagedTemplate());
      return;
    }
  };

  createTemplate = (request: express.Request, response: express.Response): void => {
    console.info(`creating or updating a template...`);
    const templateContent = request.body;
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
      const status = this.rosaeContexts.has(templateId) ? 'UPDATED' : 'CREATED';

      if (this.templatesPath) {
        try {
          fs.writeFileSync(`${this.templatesPath}/${templateId}.tmp`, JSON.stringify(templateContent), 'utf8');
          fs.renameSync(`${this.templatesPath}/${templateId}.tmp`, `${this.templatesPath}/${templateId}.json`);
        } catch (e) {
          console.log('ERROR could not save to disk');
          response.status(500).send(`could not save to disk!`);
          return;
        }
      }

      this.rosaeContexts.set(templateId, rosaeContext);

      response.status(201).send({
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
      response.status(400).send(`no template`);
      return;
    }
    if (!data) {
      response.status(400).send(`no data`);
      return;
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
        response.status(400).send(`error creating template: ${e.message}`);
        return;
      }
    } else {
      // reset ttl
      this.rosaeContextsTempCache.ttl(templateId);
    }

    const rosaeContext: RosaeContext = this.rosaeContextsTempCache.get(templateId);
    try {
      const renderedBundle: RenderedBundle = rosaeContext.render(data);
      response.status(200).send({
        status: alreadyHere ? 'EXISTED' : 'CREATED',
        renderedText: renderedBundle.text,
        renderOptions: renderedBundle.renderOptions,
      });
    } catch (e) {
      response.status(400).send(`rendering error: ${e.toString()}`);
      return;
    }
  };

  renderTemplate = (request: express.Request, response: express.Response): void => {
    const templateId: string = request.params.templateId;

    console.info(`rendering a template: ${templateId}...`);

    const rosaeContext = this.rosaeContexts.get(templateId);
    if (!rosaeContext) {
      response.status(404).send(`${templateId} does not exist`);
      return;
    } else {
      try {
        const renderedBundle: RenderedBundle = rosaeContext.render(request.body);
        response.status(200).send({
          templateId: templateId,
          renderedText: renderedBundle.text,
          renderOptions: renderedBundle.renderOptions,
        });
      } catch (e) {
        response.status(400).send(`rendering error: ${e.toString()}`);
        return;
      }
    }
  };
}
