/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

export function processGermanVerbs(inputFile: string, outputFile: string, cb: Function): void {
  console.log(`starting to process German dictionary file: ${inputFile} for verbs`);

  const outputData: any = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile),
    });

    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

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

    lineReader
      .on('line', function (line: string): void {
        const lineData: string[] = line.split('\t');
        const flexForm: string = lineData[0].toLowerCase();
        const lemma: string = lineData[1].toLocaleLowerCase();
        const props: string[] = lineData[2].split(':');

        if (props[0] === 'VER' /* && lemma === 'sehen' */) {
          function extractNumber(): 'S' | 'P' {
            if (props.includes('SIN')) return 'S';
            if (props.includes('PLU')) return 'P';

            const err = new Error();
            err.name = 'TypeError';
            err.message = `should have SIN or PLU: ${line}`;
            throw err;
          }
          function extractPerson(): 1 | 2 | 3 {
            if (props.includes('1')) return 1;
            if (props.includes('2')) return 2;
            if (props.includes('3')) return 3;

            const err = new Error();
            err.name = 'TypeError';
            err.message = `should have 1 or 2 or 3: ${line}`;
            throw err;
          }
          function extractTense(): string {
            const tenses: string[] = ['PRÄ', 'PRT', 'KJ1', 'KJ2', 'IMP', 'INF', 'PA1', 'PA2', 'EIZ'];
            for (const tense of tenses) {
              if (props.includes(tense)) return tense;
            }
            const err = new Error();
            err.name = 'TypeError';
            err.message = `tense not found: ${line}`;
            throw err;
          }

          const propTense: string = extractTense();
          let propNumber: 'S' | 'P';
          let propPerson: 1 | 2 | 3;

          switch (propTense) {
            case 'PRÄ':
            case 'PRT':
            case 'KJ1':
            case 'KJ2':
              propPerson = extractPerson();
            // continue
            case 'IMP':
              propNumber = extractNumber();
              break;
            case 'INF':
            case 'PA1':
            case 'PA2':
            case 'EIZ':
              break;
          }

          // create obj
          // sehen[PRÄ][1][SIN]
          if (!outputData[lemma]) {
            outputData[lemma] = {
              INF: null,
              PA1: null,
              PA2: null,
              KJ1: null,
              KJ2: null,
              PRÄ: null,
              PRT: null,
              IMP: null,
            };
          }
          const verbInfo = outputData[lemma];

          if (propNumber && propPerson) {
            // not IMP
            if (!verbInfo[propTense]) {
              verbInfo[propTense] = {
                S: null,
                P: null,
              };
            }
            const verbInfoTense: any = verbInfo[propTense];

            if (!verbInfoTense[propNumber]) {
              verbInfoTense[propNumber] = {
                1: null,
                2: null,
                3: null,
              };
            }
            const verbInfoTenseNumber: any = verbInfoTense[propNumber];

            verbInfoTenseNumber[propPerson] = flexForm;
          } else if (propNumber) {
            // IMP
            if (!verbInfo[propTense]) {
              verbInfo[propTense] = {
                S: null,
                P: null,
              };
            }
            const verbInfoTense: any = verbInfo[propTense];

            verbInfoTense[propNumber] = flexForm;
          } else if (propTense === 'PA2') {
            // for PA2 we keep all the flexForm during this step
            if (!verbInfo[propTense]) {
              verbInfo[propTense] = [];
            }
            if (verbInfo[propTense].indexOf(flexForm) === -1) {
              // avoid duplicates
              verbInfo[propTense].push(flexForm);
            }
          } else {
            verbInfo[propTense] = flexForm;
          }
        }
      })
      .on('close', function (): void {
        outputStream.write(JSON.stringify(outputData));
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
