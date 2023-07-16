/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'fs';

export interface Nouns {
  [key: string]: string;
}
export interface Adjectives {
  [key: string]: string;
}

const nouns: Nouns = {};
const adjectives: Adjectives = {};

const dictpath = 'resources/german-pos-dict/dictionary.dump';

const lineReader = createInterface({
  input: createReadStream(dictpath),
});

console.log(`starting to process German POS dict file: ${dictpath}`);

try {
  lineReader
    .on('line', function (line): void {
      const lineData: string[] = line.split('\t');
      const flexForm: string = lineData[0];
      const lemma: string = lineData[1];
      const props: string[] = lineData[2].split(':');

      const nature: string = props[0];

      /*
      GRU: alten altem etc.
      KOM: älteres
      SUP: ältesten
      */
      const isAdj: boolean = nature === 'ADJ' || nature === 'PA1' || nature === 'PA2';
      if (nature === 'SUB' || (isAdj && props[4] === 'GRU')) {
        const natureMapping = {
          SUB: 'SUB',
          ADJ: 'ADJ',
          PA1: 'ADJ', // considered as adj in the db
          PA2: 'ADJ', // considered as adj in the db
        };
        const targetNature: string = natureMapping[nature as 'SUB' | 'ADJ' | 'PA1' | 'PA2'];

        /*
          nouns:
          export when nature='SUB'
          key: ff or key: lemma
          val: lemma
        */
        if (targetNature === 'SUB') {
          nouns[lemma] = lemma;
          nouns[flexForm] = lemma;
        }

        /*
          adjectives:
          export when nature='ADJ'
          key: ff or key: lemma
          val: lemma
        */
        if (targetNature === 'ADJ') {
          adjectives[lemma] = lemma;
          adjectives[flexForm] = lemma;
        }
      }
    })
    .on('close', function (): void {
      writeFileSync('resources_pub/nouns.json', JSON.stringify(nouns), 'utf8');
      writeFileSync('resources_pub/adjectives.json', JSON.stringify(adjectives), 'utf8');

      console.log('done.');
    });
} catch (err) {
  console.log(err);
}
