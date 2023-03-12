/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import fs = require('fs');
import path = require('path');

import { PackagedTemplateWithCode, TemplatesMap, RosaeNlgFeatures } from './interfaces';

const FORMAT = '2.0.0';

function getFinalFileName(baseDir: string, template: string): string {
  const pathElts = path.parse(template);
  const templateWithExt = pathElts.ext == null || pathElts.ext == '' ? template + '.pug' : template;

  const fullPath = baseDir ? path.join(baseDir, templateWithExt) : templateWithExt;
  const finalFileName = fullPath.replace(new RegExp('\\\\', 'g'), '/'); // change to linux paths

  return finalFileName;
}

const includeRe = new RegExp('^include\\s+(.+)$');
function getTemplatesMap(baseDir: string, template: string, templatesMap: TemplatesMap): TemplatesMap {
  //console.log('starting to process: ' + template);
  templatesMap = templatesMap || {};

  const finalFileName = getFinalFileName(baseDir, template);
  // console.log('finalFileName is: ' + finalFileName);

  const content = fs.readFileSync(finalFileName, 'utf8');

  // add this one
  templatesMap[finalFileName] = content;

  // check includes
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.trim().match(includeRe);
    if (matches && matches[1]) {
      const matched = matches[1];
      // console.log('found included: ' + matched);
      const newBaseDir = path.parse(finalFileName).dir;
      // console.log('newBaseDir: ' + newBaseDir);
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
    packagedTemplate.src.templates = getTemplatesMap(null, packagedTemplate.src.entryTemplate, null);
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

    const compiled = rosaeNlgFeatures.compileFileClient(packagedTemplate.src.entryTemplate, options);
    packagedTemplate.comp = {
      compiled: compiled,
      compiledWithVersion: rosaeNlgFeatures.getRosaeNlgVersion(),
      compiledBy: 'rosaenlg-packager',
      compiledWhen: new Date().toISOString(),
    };
  }
}
