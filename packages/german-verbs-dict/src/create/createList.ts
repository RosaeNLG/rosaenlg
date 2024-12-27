/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';
import { VerbsInfo, VerbInfo, VerbInfoTense, VerbInfoPerson, VerbInfoImp } from '../index';

/*
  sehen sehen VER,INF,NON
  sehend sehen VER,PA1,NON
  gesehen sehen VER,PA2,NON
  sah sehen VER,1,SIN,PRT,NON
  sah sehen VER,3,SIN,PRT,NON
  sahen sehen VER,1,PLU,PRT,NON
  sahen sehen VER,3,PLU,PRT,NON
  sahst sehen VER,2,SIN,PRT,NON
  saht sehen VER,2,PLU,PRT,NON
  sehe sehen VER,1,SIN,KJ1,NON
  sehe sehen VER,1,SIN,PRÄ,NON
  sehe sehen VER,3,SIN,KJ1,NON
  sehen sehen VER,1,PLU,KJ1,NON
  sehen sehen VER,1,PLU,PRÄ,NON
  sehen sehen VER,3,PLU,KJ1,NON
  sehen sehen VER,3,PLU,PRÄ,NON
  sehest sehen VER,2,SIN,KJ1,NON
  sehet sehen VER,2,PLU,KJ1,NON
  seht sehen VER,2,PLU,PRÄ,NON
  seht sehen VER,IMP,PLU,NON
  sieh sehen VER,IMP,SIN,NON
  siehst sehen VER,2,SIN,PRÄ,NON
  sieht sehen VER,3,SIN,PRÄ,NON
  sähe sehen VER,1,SIN,KJ2,NON
  sähe sehen VER,3,SIN,KJ2,NON
  sähen sehen VER,1,PLU,KJ2,NON
  sähen sehen VER,3,PLU,KJ2,NON
  sähest sehen VER,2,SIN,KJ2,NON
  sähet sehen VER,2,PLU,KJ2,NON

  möchte	mögen	VER:MOD:1:SIN:KJ2
  möchte	mögen	VER:MOD:3:SIN:KJ2
  möchten	mögen	VER:MOD:1:PLU:KJ2
  möchten	mögen	VER:MOD:3:PLU:KJ2
  möchtest	mögen	VER:MOD:2:SIN:KJ2
  möchtet	mögen	VER:MOD:2:PLU:KJ2
  möge	mögen	VER:MOD:1:SIN:KJ1
  möge	mögen	VER:MOD:3:SIN:KJ1
  mögen	mögen	VER:MOD:1:PLU:KJ1
  mögen	mögen	VER:MOD:1:PLU:PRÄ
  mögen	mögen	VER:MOD:3:PLU:KJ1
  mögen	mögen	VER:MOD:3:PLU:PRÄ
  mögen	mögen	VER:MOD:INF
  mögest	mögen	VER:MOD:2:SIN:KJ1

  gemocht	mögen	VER:MOD:PA2

  aufgeräumt	aufräumen	VER:PA2:SFT

  gekommen	kommen	VER:PA2
*/

type PropNumber = 'S' | 'P';
type PropPerson = 1 | 2 | 3;
type PropTense = 'PRÄ' | 'PRT' | 'KJ1' | 'KJ2' | 'IMP' | 'INF' | 'PA1' | 'PA2' | 'EIZ';

function extractPerson(props: string[]): PropPerson {
  if (props.includes('1')) return 1;
  if (props.includes('2')) return 2;
  if (props.includes('3')) return 3;

  const err = new Error();
  err.name = 'TypeError';
  err.message = `should have 1 or 2 or 3: ${props}`;
  throw err;
}

function extractTense(props: string[]): PropTense {
  const tenses: string[] = ['PRÄ', 'PRT', 'KJ1', 'KJ2', 'IMP', 'INF', 'PA1', 'PA2', 'EIZ'];
  for (const tense of tenses) {
    if (props.includes(tense)) return tense as PropTense;
  }
  const err = new Error();
  err.name = 'TypeError';
  err.message = `tense not found: ${props}`;
  throw err;
}

function extractNumber(props: string[]): PropNumber {
  if (props.includes('SIN')) return 'S';
  if (props.includes('PLU')) return 'P';

  const err = new Error();
  err.name = 'TypeError';
  err.message = `should have SIN or PLU: ${props}`;
  throw err;
}

function processVerb(verbInfo: VerbInfo, props: string[], flexForm: string): void {
  const propTense: PropTense = extractTense(props);
  let propNumber: PropNumber;
  let propPerson: PropPerson;

  switch (propTense) {
    case 'PRÄ':
    case 'PRT':
    case 'KJ1':
    case 'KJ2': {
      propPerson = extractPerson(props);
      propNumber = extractNumber(props);
      if (!verbInfo[propTense as 'PRÄ' | 'PRT' | 'KJ1' | 'KJ2']) {
        verbInfo[propTense] = {
          S: undefined,
          P: undefined,
        };
      }
      const verbInfoTense: VerbInfoTense = verbInfo[propTense] as VerbInfoTense;
      if (!verbInfoTense[propNumber]) {
        verbInfoTense[propNumber] = {
          1: undefined,
          2: undefined,
          3: undefined,
        };
      }
      const verbInfoTenseNumber: VerbInfoPerson = verbInfoTense[propNumber] as VerbInfoPerson;
      verbInfoTenseNumber[propPerson] = flexForm;
      break;
    }
    case 'IMP': {
      propNumber = extractNumber(props);
      if (!verbInfo[propTense]) {
        verbInfo[propTense] = {
          S: undefined,
          P: undefined,
        };
      }
      const verbInfoImp: VerbInfoImp = verbInfo[propTense] as VerbInfoImp;
      verbInfoImp[propNumber] = flexForm;
      break;
    }
    case 'PA2': {
      // for PA2 we keep all the flexForm during this step
      if (!verbInfo['PA2']) {
        verbInfo['PA2'] = [];
      }
      // avoid duplicates
      const verbInfoPA2: string[] = verbInfo['PA2'];
      if (verbInfoPA2.indexOf(flexForm) === -1) {
        verbInfoPA2.push(flexForm);
      }
      break;
    }
    case 'INF':
    case 'PA1':
    case 'EIZ':
    default: {
      verbInfo[propTense as 'INF' | 'PA1' | 'EIZ'] = flexForm;
    }
  }
}

function findPrefixes(verbsInfo: VerbsInfo): void {
  /*
  inseparable prefixes: be, emp, ent, er, ge, miss, ver, voll, zer
  separable: ab, an, auf, aus, bei, da, ein, fern, fort, her, hin, los, mit, nach, um, unter, vor, weg, weiter, wieder, zu, zurück, zusammen, drein, empor, hervor, hierher, hinüber, umher, voraus
  a few prefixes which can be separable or inseparable, even when attached to the same root verb: durch, über, um, unter, wieder
  */
  const prefixes = [
    'ab',
    'an',
    'auf',
    'aus',
    'bei',
    'da',
    'drein',
    'durch',
    'ein',
    'empor',
    'fern',
    'fort',
    'hierher',
    'hervor',
    'her',
    'hinüber',
    'hin',
    'los',
    'mit',
    'nach',
    'umher',
    'um',
    'unter',
    'voraus',
    'vor',
    'weg',
    'weiter',
    'wieder',
    'zurück',
    'zusammen',
    'zu',
    'über',
  ]
    .sort()
    .reverse(); // longest ones before: zurück before zu, etc. otherwise double processing for different prefixes

  function getRestOfVerb(prefix: string, verb: string): string | undefined {
    if (verb.startsWith(prefix)) {
      const rest = verb.slice(prefix.length);
      return rest;
    }
  }

  for (const verb of Object.keys(verbsInfo)) {
    for (const prefix of prefixes) {
      const rest = getRestOfVerb(prefix, verb);
      if (rest) {
        // is the rest also a verb?
        const otherVerb = verbsInfo[rest];
        if (otherVerb != undefined) {
          // we have one!
          const verbInfo = verbsInfo[verb];
          verbInfo.hasPrefix = true;
          /*
          are impacted:
            PRÄ Indikativ Präsens
            PRT Indikativ Präteritum
            KJ1 Konjunktiv I Präsens
            KJ2 Konjunktiv II Präteritum 
            Imperativ Präsens also impacted but not supported
          */
          const impactedTenses = ['PRÄ', 'PRT', 'KJ1', 'KJ2'];
          for (const impactedTense of impactedTenses) {
            const impactedForm = verbInfo[impactedTense as 'PRÄ' | 'PRT' | 'KJ1' | 'KJ2'];
            if (impactedForm) {
              // let's impact
              for (const sOrP of ['S', 'P']) {
                const impactedFormSOrP = impactedForm[sOrP as 'S' | 'P'] as VerbInfoPerson;
                if (impactedFormSOrP) {
                  for (const n123 of [1, 2, 3]) {
                    const impactedFormSOrPn123 = impactedFormSOrP[n123 as 1 | 2 | 3] as string;
                    if (impactedFormSOrPn123) {
                      impactedFormSOrP[n123 as 1 | 2 | 3] = [
                        getRestOfVerb(prefix, impactedFormSOrPn123) as string,
                        prefix,
                      ];
                    }
                  }
                }
              }
            }
          }
        }
        break; // first found is enough as it is the longest
      }
    }
  }
}

export function processGermanVerbs(inputFile: string, outputFile: string, cb: () => void): void {
  console.log(`starting to process German dictionary file: ${inputFile} for verbs`);

  const outputData: VerbsInfo = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile),
    });

    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function (line: string): void {
        const lineData: string[] = line.split('\t');
        const flexForm: string = lineData[0].toLowerCase();
        const lemma: string = lineData[1].toLocaleLowerCase();
        const props: string[] = lineData[2].split(':');

        if (props[0] === 'VER' /* && (lemma === 'stimmen' || lemma === 'zustimmen') */) {
          try {
            // create obj
            // sehen[PRÄ][1][SIN]
            if (!outputData[lemma]) {
              outputData[lemma] = {
                hasPrefix: undefined,
                INF: undefined,
                PA1: undefined,
                PA2: undefined,
                KJ1: undefined,
                KJ2: undefined,
                PRÄ: undefined,
                PRT: undefined,
                IMP: undefined,
              };
            }
            const verbInfo = outputData[lemma];

            processVerb(verbInfo, props, flexForm);
          } catch (e) {
            const err = new Error();
            err.name = 'TypeError';
            err.message = `error on ${line}: ${e}`;
            throw err;
          }
        }
      })
      .on('close', function (): void {
        findPrefixes(outputData);

        outputStream.write(JSON.stringify(outputData));
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
