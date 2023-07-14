/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import fs = require('fs');
import path = require('path');

import { PackagedTemplateWithCode, TemplatesMap, RosaeNlgFeatures } from './interfaces';

const FORMAT = '2.0.0';

function getFinalFileName(baseDir: string | undefined, template: string): string {
  const pathElts = path.parse(template);
  const templateWithExt = pathElts.ext == null || pathElts.ext == '' ? template + '.pug' : template;

  const fullPath = baseDir ? path.join(baseDir, templateWithExt) : templateWithExt;
  const finalFileName = fullPath.replace(new RegExp('\\\\', 'g'), '/'); // change to linux paths

  return finalFileName;
}

const includeRe = /^include\s+(.+)$/;
function getTemplatesMap(
  baseDir: string | undefined,
  template: string,
  templatesMap: TemplatesMap | undefined,
): TemplatesMap {
  templatesMap = templatesMap || {};

  const finalFileName = getFinalFileName(baseDir, template);

  const content = fs.readFileSync(finalFileName, 'utf8');

  // add this one
  templatesMap[finalFileName] = content;

  // check includes
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const matches = line.trim().match(includeRe);
    if (matches && matches[1]) {
      const matched = matches[1];
      const newBaseDir = path.parse(finalFileName).dir;
      templatesMap = getTemplatesMap(newBaseDir, matched, templatesMap);
    }
  }
  return templatesMap;
}

export function completePackagedTemplateJson(
  packagedTemplate: PackagedTemplateWithCode,
  rosaeNlgFeatures: RosaeNlgFeatures,
): void {
  packagedTemplate.format = FORMAT;

  // if templates are not here, we read them from the disk
  if (!packagedTemplate.src.templates) {
    packagedTemplate.src.templates = getTemplatesMap(undefined, packagedTemplate.src.entryTemplate, undefined);
  }

  // compile if asked
  if (packagedTemplate.src.compileInfo && packagedTemplate.src.compileInfo.activate) {
    const options: any = {
      embedResources: true,
      language: packagedTemplate.src.compileInfo.language,
      compileDebug: packagedTemplate.src.compileInfo.compileDebug,
      staticFs: packagedTemplate.src.templates,
      // optional forced list elements
      verbs: packagedTemplate.src.compileInfo.verbs,
      words: packagedTemplate.src.compileInfo.words,
      adjectives: packagedTemplate.src.compileInfo.adjectives,
    };

    const compiled = (rosaeNlgFeatures.compileFileClient as (path: string, options: any) => string)(
      packagedTemplate.src.entryTemplate,
      options,
    );
    packagedTemplate.comp = {
      compiled: compiled,
      compiledWithVersion: rosaeNlgFeatures.getRosaeNlgVersion(),
      compiledBy: 'rosaenlg-packager',
      compiledWhen: new Date().toISOString(),
    };
  }
}
