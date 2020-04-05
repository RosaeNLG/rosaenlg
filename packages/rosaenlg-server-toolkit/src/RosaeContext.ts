import {
  PackagedTemplateWithUser,
  PackagedTemplateComp,
  completePackagedTemplateJson,
  RosaeNlgFeatures,
} from 'rosaenlg-packager';
import { RenderOptions } from './RenderOptions';
import { RenderedBundle } from './RenderedBundle';
import { createHash } from 'crypto';

export class RosaeContext {
  private format: string; // for future use
  private user: string;
  private templateId: string;
  private packagedTemplateWithUser: PackagedTemplateWithUser;

  private compiledFct: Function;
  private nlgLib: any;

  public hadToCompile: boolean;

  /*
    rosaeNlgFeatures can be null, for instance when used on get on Lambda: we don't need to be able to compile
  */
  constructor(packagedTemplateWithUserAsParam: PackagedTemplateWithUser, rosaeNlgFeatures: RosaeNlgFeatures) {
    // make a copy
    this.packagedTemplateWithUser = JSON.parse(JSON.stringify(packagedTemplateWithUserAsParam));

    const rosaeNlgVersion = rosaeNlgFeatures?.getRosaeNlgVersion();
    this.nlgLib = rosaeNlgFeatures?.NlgLib;

    this.templateId = this.packagedTemplateWithUser.templateId;
    this.user = this.packagedTemplateWithUser.user;
    this.format = this.packagedTemplateWithUser.format;

    console.log({ templateId: this.templateId, message: `RosaeContext constructor` });

    const packagedTemplateComp: PackagedTemplateComp = this.packagedTemplateWithUser.comp;
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
      this.hadToCompile = false;
    } else {
      console.log({ templateId: this.templateId, message: 'should compile as no compiled content found' });

      if (!rosaeNlgFeatures || rosaeNlgFeatures.compileFileClient == null) {
        console.log({
          templateId: this.templateId,
          message: `was not compiled but could not find compiler`,
        });
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `cannot compile because no compiler found`;
        throw err;
      } else {
        // ok, compile
        try {
          // activate comp if not already activated
          this.packagedTemplateWithUser.src.compileInfo.activate = true;
          completePackagedTemplateJson(this.packagedTemplateWithUser, rosaeNlgFeatures);

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

    this.compiledFct = new Function(
      'params',
      `${this.packagedTemplateWithUser.comp.compiled}; return template(params);`,
    );

    // autotest if we had to compile AND if we could compile, otherwise we don't care no more
    if (this.hadToCompile && this.compiledFct) {
      const autotest = this.packagedTemplateWithUser.src.autotest;
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
    return this.packagedTemplateWithUser;
  }

  public getSha1(): string {
    return createHash('sha1').update(JSON.stringify(this.packagedTemplateWithUser.src)).digest('hex');
  }
}
