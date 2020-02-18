import { PackagedTemplate, PackagedTemplateSrc, PackagedTemplateComp } from 'gulp-rosaenlg';
import { compileFileClient, getRosaeNlgVersion, NlgLib } from 'rosaenlg';
import { RenderOptions } from './RenderOptions';
import { RenderedBundle } from './RenderedBundle';
import winston = require('winston');

export interface PackagedTemplateWithUser extends PackagedTemplate {
  user: string;
}

export class RosaeContext {
  private static ROSAENLG_VERSION = getRosaeNlgVersion();

  private format: string; // for future use
  private user: string;
  private templateId: string;
  private templateSrcPart: PackagedTemplateSrc;
  private templateCompPart: PackagedTemplateComp;

  private compiledFct: Function;
  public hadToCompile: boolean;

  constructor(packagedTemplateWithUser: PackagedTemplateWithUser) {
    this.templateId = packagedTemplateWithUser.templateId;
    this.user = packagedTemplateWithUser.user;
    this.format = packagedTemplateWithUser.format;
    this.templateSrcPart = packagedTemplateWithUser.src;

    winston.info({ templateId: this.templateId, message: `RosaeContext constructor` });

    // only compile if useful
    if (
      packagedTemplateWithUser.comp &&
      packagedTemplateWithUser.comp.compiledWithVersion === RosaeContext.ROSAENLG_VERSION &&
      packagedTemplateWithUser.comp.compiled != null &&
      packagedTemplateWithUser.comp.compiled != ''
    ) {
      this.templateCompPart = packagedTemplateWithUser.comp;
      this.hadToCompile = false;
      winston.info({
        templateId: this.templateId,
        message: `was already compiled: ${this.templateCompPart.compiledBy} ${this.templateCompPart.compiledWhen}`,
      });
    } else {
      // compile
      try {
        const opts: any = Object.assign({}, packagedTemplateWithUser.src.compileInfo);
        opts.staticFs = packagedTemplateWithUser.src.templates;
        opts.embedResources = true;

        this.templateCompPart = {
          compiledWithVersion: RosaeContext.ROSAENLG_VERSION,
          compiled: compileFileClient(packagedTemplateWithUser.src.entryTemplate, opts),
          compiledBy: 'rosaenlg-node-server',
          compiledWhen: new Date().toISOString(),
        };

        winston.info({
          templateId: this.templateId,
          message: `properly compiled with RosaeNLG version ${RosaeContext.ROSAENLG_VERSION}`,
        });
      } catch (e) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `cannot compile: ${e.message}`;
        throw err;
      }
      this.hadToCompile = true;
    }
    this.compiledFct = new Function('params', `${this.templateCompPart.compiled}; return template(params);`);

    // autotest
    const autotest = packagedTemplateWithUser.src.autotest;
    if (autotest != null && autotest.activate) {
      winston.info({ templateId: this.templateId, message: `autotest is activated` });

      let renderedBundle: RenderedBundle;
      try {
        renderedBundle = this.render(autotest.input);
      } catch (e) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `cannot render autotest: ${e.message}`;
        throw err;
      }

      for (let i = 0; i < autotest.expected.length; i++) {
        const expectedElt = autotest.expected[i];
        if (renderedBundle.text.indexOf(expectedElt) == -1) {
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `autotest failed on ${expectedElt}:` + ` rendered was ${renderedBundle.text}`;
          throw err;
        }
      }
      // everything went ok
    }
  }

  public render(options: any): RenderedBundle {
    const renderOptions = new RenderOptions(options);
    options.util = new NlgLib(renderOptions);

    try {
      return {
        text: this.compiledFct(options),
        renderOptions: renderOptions,
      };
    } catch (e) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `cannot render autotest: ${e.message}`;
      throw err;
    } finally {
      // must not alter options!
      delete options.util;
    }
  }

  public getTemplateId(): string {
    return this.templateId;
  }

  public getFullTemplate(): PackagedTemplateWithUser {
    return {
      format: this.format,
      templateId: this.templateId,
      user: this.user,
      src: this.templateSrcPart,
      comp: this.templateCompPart,
    } as PackagedTemplateWithUser;
  }
}
