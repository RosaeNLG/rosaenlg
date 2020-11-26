/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PackagedTemplate,
  PackagedTemplateWithCode,
  PackagedTemplateExisting,
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
  private packagedTemplate: PackagedTemplate;
  public packageType: 'existing' | 'custom';

  private compiledFct: Function;
  private nlgLib: any;

  public hadToCompile: boolean;

  /*
    rosaeNlgFeatures can be null, for instance when used on get on Lambda: we don't need to be able to compile
  */
  constructor(packagedTemplateAsParam: PackagedTemplate, rosaeNlgFeatures: RosaeNlgFeatures) {
    // make a copy
    this.packagedTemplate = JSON.parse(JSON.stringify(packagedTemplateAsParam));

    const rosaeNlgVersion = rosaeNlgFeatures?.getRosaeNlgVersion();
    this.nlgLib = rosaeNlgFeatures?.NlgLib;

    this.templateId = this.packagedTemplate.templateId;
    this.user = this.packagedTemplate.user;
    this.format = this.packagedTemplate.format;

    console.log({ templateId: this.templateId, message: `RosaeContext constructor` });

    this.packageType = this.packagedTemplate.type || 'custom';

    const packagedTemplateComp: PackagedTemplateComp = (this.packagedTemplate as PackagedTemplateWithCode).comp;
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
          (this.packagedTemplate as PackagedTemplateWithCode).src.compileInfo.activate = true;
          completePackagedTemplateJson(this.packagedTemplate as PackagedTemplateWithCode, rosaeNlgFeatures);

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
      `${(this.packagedTemplate as PackagedTemplateWithCode).comp.compiled}; return template(params);`,
    );

    // autotest if we had to compile AND if we could compile, otherwise we don't care no more
    if (this.hadToCompile && this.compiledFct) {
      const autotest = (this.packagedTemplate as PackagedTemplateWithCode).src.autotest;
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
    options.outputData = {};

    const renderOptions = new RenderOptions(options);

    try {
      options.util = new this.nlgLib(renderOptions);
      return {
        text: this.compiledFct(options),
        renderOptions: renderOptions,
        outputData: options.outputData,
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

  public getFullTemplate(): PackagedTemplate {
    const copy = { ...this.packagedTemplate };
    // don't give src for shared templates
    if (this.packageType == 'existing') {
      delete copy.src;
      delete copy.comp;
    }
    return copy;
  }

  public getSha1(): string {
    let toHash: string = null;
    if (this.packageType == 'custom') {
      toHash = JSON.stringify(this.packagedTemplate.src);
    } else {
      // put all the feature that make the template: src, which, etc.
      toHash = JSON.stringify(this.packagedTemplate.src) + (this.packagedTemplate as PackagedTemplateExisting).which;
    }
    return createHash('sha1').update(toHash).digest('hex');
  }
}
