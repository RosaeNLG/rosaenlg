/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';
import { TenseIndex, VerbInfo, VerbInfoMode, VerbInfoModeKey, VerbInfoTense, VerbsInfo } from '../index';

const modes = ['cond', 'ger', 'impr', 'ind', 'inf', 'part', 'sub'];
const tenses = ['pres', 'past', 'impf', 'fut'];
const possibleClitics = [
  'cela',
  'cele',
  'celi',
  'celo',
  'cene',
  'ci',
  'gli',
  'gliela',
  'gliele',
  'glieli',
  'glielo',
  'gliene',
  'la',
  'le',
  'li',
  'lo',
  'mela',
  'mele',
  'meli',
  'melo',
  'mene',
  'mi',
  'ne',
  'sela',
  'sele',
  'seli',
  'selo',
  'sene',
  'si',
  'tela',
  'tele',
  'teli',
  'telo',
  'tene',
  'ti',
  'vela',
  'vele',
  'veli',
  'velo',
  'vene',
  'vi',
];

export function processItalianVerbs(inputFile: string, outputFile: string, cb: () => void): void {
  console.log(`starting to process Italian dictionary file: ${inputFile} for verbs`);

  const outputData: VerbsInfo = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile, { encoding: 'latin1' }),
    });

    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function (line: string): void {
        const lineData: string[] = line.split('\t');
        if (lineData.length != 3) {
          return;
        }
        const flexForm: string = lineData[0];
        const lemma: string = lineData[1];
        const props: string[] = lineData[2].split(':');

        if (props.length != 2) {
          return;
        }
        const derivational: string[] = props[0].split('-');
        if (derivational.length < 1) {
          return;
        }
        const type = derivational[0];
        const inflectional: string[] = props[1].split('+');

        if (type === 'VER' && lemma != 'essere' && lemma != 'avere') {
          // cond/ger/impr/ind/inf/part/sub: Conditional, gerundive, imperative, indicative, infinitive, participle, subjunctive.
          let mode: string | null = null;
          for (const availableMode of modes) {
            if (inflectional.indexOf(availableMode) > -1) {
              mode = availableMode;
              break;
            }
          }
          if (!mode) {
            console.log(`no mode! ${line}`);
          }

          /*
            mangia	mangiare	VER:impr+pres+2+s
            mangiameli	mangiare	VER:impr+pres+2+s+meli
            cela/cele/celi/celo/cene/ci/gli/gliela/gliele/glieli/glielo/gliene/la/
            le/li/lo/mela/mele/meli/melo/mene/mi/ne/sela/sele/seli/selo/sene/si/
            tela/tele/teli/telo/tene/ti/vela/vele/veli/velo/vene/vi
            Clitics attached to the verb.
            */

          const clitics: string[] = [];
          for (const possibleClitic of possibleClitics) {
            if (inflectional.indexOf(possibleClitic) > -1) {
              clitics.push(possibleClitic);
            }
          }

          // pre/past/impf/fut: Present, past, imperfective, future.
          let tense: string | null = null;
          for (const possibleTense of tenses) {
            if (inflectional.indexOf(possibleTense) > -1) {
              tense = possibleTense;
              break;
            }
          }
          if (!tense) {
            console.log(`no tense! ${line}`);
          }

          const newProps = [];
          // s/p: Number.
          // can be null
          let number: 'S' | 'P' | null = null;
          if (inflectional.indexOf('s') > -1) {
            number = 'S';
          } else if (inflectional.indexOf('p') > -1) {
            number = 'P';
          }
          if (number) {
            newProps.push(number);
          }

          // 1/2/3: Person.
          // can be null
          let person: 1 | 2 | 3 | null = null;
          if (inflectional.indexOf('1') > -1) {
            person = 1;
          } else if (inflectional.indexOf('2') > -1) {
            person = 2;
          } else if (inflectional.indexOf('3') > -1) {
            person = 3;
          }
          if (person) {
            newProps.push(person);
          }

          // f/m: Gender (only relevant for participles).
          // can be null
          let gender: 'M' | 'F' | null = null;
          if (inflectional.indexOf('f') > -1) {
            gender = 'F';
          } else if (inflectional.indexOf('M') > -1) {
            gender = 'M';
          }
          if (gender) {
            newProps.push(gender);
          }

          if (!outputData[lemma]) {
            outputData[lemma] = {
              cond: null,
              ger: null,
              impr: null,
              ind: null,
              inf: null,
              part: null,
              sub: null,
            };
          }

          const verbInfo = outputData[lemma] as VerbInfo;

          if (!verbInfo[mode as VerbInfoModeKey]) {
            verbInfo[mode as VerbInfoModeKey] = {
              pres: null,
              past: null,
              impf: null,
              fut: null,
            };
          }

          const verbInfoMode = verbInfo[mode as VerbInfoModeKey] as VerbInfoMode;

          if (!verbInfoMode[tense as TenseIndex]) {
            verbInfoMode[tense as TenseIndex] = {};
          }

          const verbInfoTense: VerbInfoTense = verbInfoMode[tense as TenseIndex] as VerbInfoTense;

          const newPropsKey = newProps.join('');

          if (newPropsKey != '') {
            // sometimes we already have the value
            // we override only if this one has no clitic
            if (!verbInfoTense[newPropsKey] || clitics.length === 0) {
              verbInfoTense[newPropsKey] = flexForm;
            }
          } else {
            // inf pres and ger pres
            verbInfoMode[tense as 'pres'] = flexForm;
          }
        }
      })
      .on('close', function (): void {
        outputStream.write(
          // remove null keys
          JSON.stringify(outputData, function (_key: string, value: any): any {
            if (value) return value;
          }),
        );
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
