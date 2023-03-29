/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import fs = require('fs');
import path = require('path');

import { PackagedTemplateWithCode } from './interfaces';

export function expandPackagedTemplateJson(packagedTemplate: PackagedTemplateWithCode, destFolder: string): void {
  const templateIds = Object.keys(packagedTemplate.src.templates);
  for (const templateId of templateIds) {
    const templateContent = packagedTemplate.src.templates[templateId];

    const fileDest = path.join(destFolder, templateId);

    const dir = path.dirname(fileDest);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fileDest, templateContent, 'utf8');
  }
}
