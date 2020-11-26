/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'fs';

const morphItPath = 'resources_src/morph-it/morph-it_048.txt';

const lineReader = createInterface({
  input: createReadStream(morphItPath, { encoding: 'latin1' }),
});

console.log('starting to process morph-it file: ' + morphItPath);

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
      if (lineData.length != 3) {
        return;
      }
      const flexform: string = lineData[0];
      const lemma: string = lineData[1];
      const props: string[] = lineData[2].split(':');
      if (props.length != 2) {
        return;
      }

      const derivational: string[] = props[0].split('-');
      const inflectional: string[] = props[1].split('+');

      if (derivational.length < 1) {
        return;
      }

      const nature = derivational[0];
      if (nature != 'NOUN' && nature != 'ADJ' && nature != 'VER') {
        return;
      }
      if (nature === 'ADJ' && inflectional.indexOf('pos') === -1) {
        return;
      }
      if (nature === 'VER' && (inflectional.indexOf('part') === -1 || inflectional.indexOf('past') === -1)) {
        return;
      }

      let gender: 'M' | 'F';
      let number: 'S' | 'P';

      switch (nature) {
        case 'NOUN': {
          if (derivational.indexOf('M') > -1) {
            gender = 'M';
          } else if (derivational.indexOf('F') > -1) {
            gender = 'F';
          }
          break;
        }
        case 'VER':
        case 'ADJ': {
          if (inflectional.indexOf('m') > -1) {
            gender = 'M';
          } else if (inflectional.indexOf('f') > -1) {
            gender = 'F';
          }
          break;
        }
      }

      if (inflectional.indexOf('s') > -1) {
        number = 'S';
      } else if (inflectional.indexOf('p') > -1) {
        number = 'P';
      }

      if (!gender || !number) {
        console.log(`incomplete: ${line}`);
      }

      const natureMapping = {
        VER: 'PP', // past participle
        ADJ: 'ADJ',
        NOUN: 'NOUN',
      };

      const targetNature: string = natureMapping[nature];

      /*
        adjectives
          nature='ADJ' OR nature='PP'
          key: lemma or flexform
          val: lemma, nature
      */
      if (targetNature === 'ADJ' || targetNature === 'PP') {
        const isPp: boolean = targetNature === 'PP';
        adjectives[lemma] = adjectives[flexform] = [lemma, isPp];
      }

      /*
        pastParticiples
          nature='PP' AND gender='M' AND number='S'
          key: lemma
          val: flexform
      */
      if (targetNature === 'PP' && gender === 'M' && number === 'S') {
        pastParticiples[lemma] = flexform;
      }

      /*
        nouns
          nature='NOUN'
          key: lemma or flexform
          val: lemma
      */
      if (targetNature === 'NOUN') {
        nouns[lemma] = nouns[flexform] = lemma;
      }
    })
    .on('close', function (): void {
      writeFileSync('resources_pub/nouns.json', JSON.stringify(nouns), 'utf8');
      writeFileSync('resources_pub/adjectives.json', JSON.stringify(adjectives), 'utf8');
      writeFileSync('resources_pub/pastParticiples.json', JSON.stringify(pastParticiples), 'utf8');

      console.log('done.');
    });
} catch (err) {
  console.log(err);
}
