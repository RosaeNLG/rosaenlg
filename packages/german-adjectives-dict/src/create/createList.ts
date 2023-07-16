/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';
import {
  AdjectivesInfo,
  AdjectiveInfo,
  AdjectiveInfoCase,
  AdjectiveGenderInfo,
  GermanCaseForDict,
  GermanArticleForDict,
} from '../index';

export function processGermanAdjectives(inputFile: string, outputFile: string, cb: () => void): void {
  console.log(`starting to process German dictionary file: ${inputFile} for adjectives`);

  const adjectivesInfo: AdjectivesInfo = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile),
    });

    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function (line: string): void {
        const lineData: string[] = line.split('\t');
        const flexForm: string = lineData[0];
        const lemma: string = lineData[1];
        const props: string[] = lineData[2].split(':');

        const type = props[0];
        /*
      GRU: alten altem etc.
      KOM: älteres
      SUP: ältesten
      */
        if ((type === 'ADJ' || type === 'PA1' || type === 'PA2') && props[4] === 'GRU' /* && lemma=='alt' */) {
          const propCase: GermanCaseForDict = props[1] as GermanCaseForDict;
          const propNumber: string = props[2];
          const propGender: 'MAS' | 'FEM' | 'NEU' = props[3] as 'MAS' | 'FEM' | 'NEU';
          const propArt: GermanArticleForDict = props[5] as GermanArticleForDict;

          // create obj
          if (!adjectivesInfo[lemma]) {
            adjectivesInfo[lemma] = {
              AKK: null,
              DAT: null,
              GEN: null,
              NOM: null,
            };
          }
          const adjectiveInfo: AdjectiveInfo = adjectivesInfo[lemma];

          if (!adjectiveInfo[propCase]) {
            adjectiveInfo[propCase] = {
              DEF: null,
              IND: null,
              SOL: null,
            };
          }
          const adjectiveInfoCase: AdjectiveInfoCase = adjectiveInfo[propCase] as AdjectiveInfoCase;

          if (!adjectiveInfoCase[propArt]) {
            adjectiveInfoCase[propArt] = {
              P: null,
              M: null,
              F: null,
              N: null,
            };
          }
          const adjectiveGenderInfo: AdjectiveGenderInfo = adjectiveInfoCase[propArt] as AdjectiveGenderInfo;

          if (propNumber === 'SIN') {
            const genderMapping = {
              MAS: 'M',
              FEM: 'F',
              NEU: 'N',
            };
            adjectiveGenderInfo[genderMapping[propGender] as 'M' | 'F' | 'N'] = flexForm;
          } else {
            // 'PLU' we assume it's all the same, does not depend on gender
            adjectiveGenderInfo['P'] = flexForm;
          }
        }
      })
      .on('close', function (): void {
        outputStream.write(JSON.stringify(adjectivesInfo));
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
