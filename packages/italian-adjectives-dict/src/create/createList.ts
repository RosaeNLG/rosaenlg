/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

import { AdjectivesInfo, AdjectiveInfo } from '../index';

const irregulars = ['bello', 'buono', 'grande', 'santo'];

type TypeGender = 'M' | 'F';
type TypeNumber = 'S' | 'P';

function getGender(inflectional: string[]): TypeGender {
  if (inflectional.indexOf('m') > -1) {
    return 'M';
  } else if (inflectional.indexOf('f') > -1) {
    return 'F';
  } else {
    console.log(`${inflectional} has no gender!`);
  }
}

function getNumber(inflectional: string[]): TypeNumber {
  if (inflectional.indexOf('s') > -1) {
    return 'S';
  } else if (inflectional.indexOf('p') > -1) {
    return 'P';
  } else {
    console.log(`${inflectional} has no number!`);
  }
}

function getType(props: string[]): string {
  const derivational: string[] = props[0].split('-');
  if (derivational.length < 1) {
    return null;
  } else {
    return derivational[0];
  }
}

/*
  educati	educare	VER:part+past+p+m
  educato	educare	VER:part+past+s+m
  brutalizzato	brutalizzare	VER:part+past+s+m
*/
function processAdj(
  adjectiveInfo: AdjectiveInfo,
  type: string,
  lemma: string,
  inflectional: string[],
  flexForm: string,
): void {
  const gender = getGender(inflectional);
  const number = getNumber(inflectional);

  const actual = adjectiveInfo[gender + number];
  if (!actual) {
    adjectiveInfo[gender + number] = flexForm;
  } else {
    // grand'	grande	ADJ:pos+f+p
    if (actual.endsWith("'")) {
      console.log(`${gender}${number} for ${lemma} was ${actual}, will become ${flexForm}`);
      adjectiveInfo[gender + number] = flexForm;
    } else if (type === 'VER') {
      // we do not replace when comes from a Verb, Adj is better
    } else {
      console.log(`${gender}${number} for ${lemma} was ${actual}, will NOT become ${flexForm}`);
      // do not replace here
    }
  }
}

export function processItalianAdjectives(inputFile: string, outputFile: string, cb: () => void): void {
  console.log(`starting to process Italian resource file: ${inputFile} for adjectives`);

  const adjectivesInfo: AdjectivesInfo = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile, { encoding: 'latin1' }),
    });

    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function (line: string): void {
        const lineData: string[] = line.split('\t');
        if (lineData.length != 3) {
          return;
        }
        const flexForm: string = lineData[0];
        // On.	onorevole	ADJ:pos+f+s
        if (flexForm.indexOf('.') > -1) {
          return;
        }

        const lemma: string = lineData[1];
        const props: string[] = lineData[2].split(':');

        if (props.length != 2) {
          return;
        }

        const type = getType(props);
        if (type === null) {
          return;
        }

        const inflectional: string[] = props[1].split('+');

        if (
          (type === 'ADJ' && inflectional.indexOf('pos') > -1 && irregulars.indexOf(lemma) === -1) ||
          (type === 'VER' && inflectional.indexOf('part') > -1 && inflectional.indexOf('past') > -1)
        ) {
          // create obj
          if (!adjectivesInfo[lemma]) {
            adjectivesInfo[lemma] = {
              MS: null, // used only for verbs
              MP: null,
              FS: null,
              FP: null,
            };
          }
          const adjectiveInfo: AdjectiveInfo = adjectivesInfo[lemma];

          processAdj(adjectiveInfo, type, lemma, inflectional, flexForm);
        }
      })
      .on('close', function (): void {
        Object.keys(adjectivesInfo).forEach(function (key: string): void {
          // for verbs key must become MS, not the infinitive verb
          const ms: string = adjectivesInfo[key]['MS'];
          if (ms) {
            // there are some exceptions without MS...
            if (ms != key) {
              adjectivesInfo[ms] = adjectivesInfo[key];
              delete adjectivesInfo[key];
            }
            delete adjectivesInfo[ms]['MS'];
          }
        });

        outputStream.write(JSON.stringify(adjectivesInfo));
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
