/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'fs';

const lefffpath = 'resources_src/lefff-3.4.mlex/lefff-3.4.mlex';

const lineReader = createInterface({
  input: createReadStream(lefffpath),
});

console.log('starting to process LEFFF file: ' + lefffpath);

export interface Nouns {
  [key: string]: string;
}
export interface Adjectives {
  [key: string]: [string, boolean];
}
export interface PastParticiples {
  [key: string]: string;
}

const nouns: Nouns = {};
const adjectives: Adjectives = {};
const pastParticiples: PastParticiples = {};

try {
  lineReader
    .on('line', function (line): void {
      const lineData: string[] = line.split('\t');
      const ff: string = lineData[0];
      const nature: string = lineData[1];
      const racine: string = lineData[2];
      const codes: string = lineData[3];

      let fem = false;
      let plu = false;

      if (codes.indexOf('f') > -1) {
        fem = true;
      }
      if (codes.indexOf('p') > -1) {
        plu = true;
      }

      /*
        nouns:
        in the file: nature='nc'
        key: ff
        val: racine
      */
      if (nature === 'nc') {
        nouns[ff] = racine;
      }

      /*
      adjectives:
      in the file: nature='adj'
      key: ff
      val: racine, isPp if K in codes

      potentially key is not unique, but do we care?
        fini = fini ms
        fini = finir Kms

      pp:
      in the file: 
        nature='adj'
        masc=1
        sing=1
      key: racine
      val: ff

      */
      if (nature === 'adj') {
        const isPp = codes.indexOf('K') > -1;
        adjectives[ff] = [racine, isPp];
        if (isPp && !fem && !plu) {
          pastParticiples[racine] = ff;
        }
      }
    })
    .on('close', function (): void {
      /*
        exceptions...
        yeux	nc	oeil	mp
        yeux	nc	yeux	mp
        chevaux	nc	cheval	mp
        chevaux	nc	chevau	mp
        chevaux	nc	chevaux	mp
      */
      nouns['yeux'] = 'oeil';
      nouns['chevaux'] = 'cheval';

      writeFileSync('resources_pub/nouns.json', JSON.stringify(nouns), 'utf8');
      writeFileSync('resources_pub/adjectives.json', JSON.stringify(adjectives), 'utf8');
      writeFileSync('resources_pub/pastParticiples.json', JSON.stringify(pastParticiples), 'utf8');

      console.log('done.');
    });
} catch (err) {
  console.log(err);
}
