import {
  PackagedTemplateWithUser,
  PackagedTemplateSrc,
  PackagedTemplateComp,
  compToPackagedTemplateComp,
} from './PackagedTemplate';
import { RenderOptions } from './RenderOptions';
import { RenderedBundle } from './RenderedBundle';

export interface RosaeNlgFeatures {
  getRosaeNlgVersion: Function;
  NlgLib: any;
  compileFileClient?: Function; // when just for rendering
}

export class RosaeContext {
  // private static ROSAENLG_VERSION = getRosaeNlgVersion();

  private format: string; // for future use
  private user: string;
  private templateId: string;
  private templateSrcPart: PackagedTemplateSrc;
  private templateCompPart: PackagedTemplateComp;

  private compiledFct: Function;
  private nlgLib: any;

  public hadToCompile: boolean;

  // can be used with rosaeNlgFeatures as null, but only to manipulate packaged templates
  constructor(packagedTemplateWithUser: PackagedTemplateWithUser, rosaeNlgFeatures: RosaeNlgFeatures, origin: string) {
    const rosaeNlgVersion = rosaeNlgFeatures?.getRosaeNlgVersion();

    this.nlgLib = rosaeNlgFeatures?.NlgLib;

    this.templateId = packagedTemplateWithUser.templateId;
    this.user = packagedTemplateWithUser.user;
    this.format = packagedTemplateWithUser.format;
    this.templateSrcPart = packagedTemplateWithUser.src;

    console.log({ templateId: this.templateId, message: `RosaeContext constructor` });

    const packagedTemplateComp: PackagedTemplateComp = packagedTemplateWithUser.comp;
    // only compile if useful
    if (packagedTemplateComp && packagedTemplateComp.compiled && packagedTemplateComp.compiled != '') {
      const compiledWithVersion = packagedTemplateComp.compiledWithVersion;
      if (!compiledWithVersion || !rosaeNlgVersion || compiledWithVersion != rosaeNlgVersion) {
        console.warn({
          templateId: this.templateId,
          message: `found compiled with ${compiledWithVersion} while runtime version is ${rosaeNlgVersion}; but will continue`,
        });
      } else {
        console.log({
          templateId: this.templateId,
          message: `was already compiled: ${packagedTemplateComp.compiledBy} ${packagedTemplateComp.compiledWhen} ${packagedTemplateComp.compiledWithVersion}`,
        });
      }
      this.templateCompPart = packagedTemplateComp;
      this.hadToCompile = false;
    } else {
      console.log({ templateId: this.templateId, message: 'should compile as no compiled content found' });

      if (!rosaeNlgFeatures || rosaeNlgFeatures.compileFileClient == null) {
        console.log({
          templateId: this.templateId,
          message: `was not compiled but could not find compiler`,
        });
        /*
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `cannot compile because no compiler found`;
        throw err;
        */
      } else {
        // ok, compile
        try {
          this.templateCompPart = compToPackagedTemplateComp(
            packagedTemplateWithUser.src,
            rosaeNlgFeatures.compileFileClient,
            rosaeNlgVersion,
            origin,
          );
          console.log({
            templateId: this.templateId,
            message: `properly compiled with RosaeNLG version ${rosaeNlgVersion}`,
          });
        } catch (e) {
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `cannot compile: ${e.message}`;
          throw err;
        }
        this.hadToCompile = true;
      }
    }

    if (this.templateCompPart) {
      this.compiledFct = new Function('params', `${this.templateCompPart.compiled}; return template(params);`);
    }

    // autotest if we had to compile AND if we could compile, otherwise we don't care no more
    if (this.hadToCompile && this.compiledFct) {
      const autotest = packagedTemplateWithUser.src.autotest;
      if (autotest != null && autotest.activate) {
        console.log({ templateId: this.templateId, message: `autotest is activated` });

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
  }

  public render(originalOptions: any): RenderedBundle {
    // we clone as rendering tends to change data
    const options = JSON.parse(JSON.stringify(originalOptions));

    const renderOptions = new RenderOptions(options);

    try {
      options.util = new this.nlgLib(renderOptions);
      return {
        text: this.compiledFct(options),
        renderOptions: renderOptions,
      };
    } catch (e) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `cannot render: ${e.message}`;
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
