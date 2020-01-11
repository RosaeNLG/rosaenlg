import { PackagedTemplate } from 'gulp-rosaenlg/dist/PackagedTemplate';
import { compileFile, NlgLib } from 'rosaenlg';
import { RenderOptions } from './RenderOptions';
import { RenderedBundle } from './RenderedBundle';
import winston = require('winston');
// import {inspect} from 'util';

interface PackagedTemplateWithUser extends PackagedTemplate {
  user: string;
}

export class RosaeContext {
  private originalPackagedTemplate: PackagedTemplate;
  private templateId: string;
  private compiledFct: Function;

  constructor(packagedTemplateWithUser: PackagedTemplateWithUser) {
    this.originalPackagedTemplate = packagedTemplateWithUser;
    this.templateId = packagedTemplateWithUser.templateId;

    winston.info(`RosaeContext constructor for ${this.templateId}`);

    const opts: any = Object.assign({}, packagedTemplateWithUser.compileInfo);
    opts.staticFs = packagedTemplateWithUser.templates;

    // compile
    try {
      this.compiledFct = compileFile(packagedTemplateWithUser.entryTemplate, opts);
    } catch (e) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `cannot compile: ${e.message}`;
      throw err;
    }

    // autotest
    const autotest = packagedTemplateWithUser.autotest;
    if (autotest != null && autotest.activate) {
      winston.info('autotest is activated');

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

    // console.log(this.compiledFct.toString());
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

  public getPackagedTemplate(): PackagedTemplate {
    return this.originalPackagedTemplate;
  }
}
