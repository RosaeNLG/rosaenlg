import fs = require('fs');
import path = require('path');

import { PackagedTemplateWithCode } from './interfaces';

export function expandPackagedTemplateJson(packagedTemplate: PackagedTemplateWithCode, destFolder: string): void {
  const templateIds = Object.keys(packagedTemplate.src.templates);
  for (let i = 0; i < templateIds.length; i++) {
    const templateId = templateIds[i];
    const templateContent = packagedTemplate.src.templates[templateId];

    const fileDest = path.join(destFolder, templateId);

    const dir = path.dirname(fileDest);
    //console.log(`for file ${fileDest}, will create ${dir} directory`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fileDest, templateContent, 'utf8');
  }
}
