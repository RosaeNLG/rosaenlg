/**
 * @license
 * Copyright 2024 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';

export function processEnglishVerbsIrregular(outputFileName: string, cb: () => void): void {
  console.log('starting to generate full verbs list');

  const irregularVerbs = JSON.parse(fs.readFileSync('resources/irregularVerbs.json', 'utf8'));

  const consonantDoubledList = JSON.parse(fs.readFileSync('resources/consonantDoubled.json', 'utf8'));
  for (const verb of consonantDoubledList) {
    const preterit = verb + verb.slice(-1) + 'ed';
    irregularVerbs[verb] = [[preterit, preterit]];
  }

  fs.writeFileSync(outputFileName, JSON.stringify(irregularVerbs));

  cb();
}
