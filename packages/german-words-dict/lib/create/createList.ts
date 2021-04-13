/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';
import { WordsInfo, WordInfo } from '../index';

export function processGermanWords(inputFile: string, outputFile: string, cb: () => void): void {
  console.log(`starting to process German dictionary file: ${inputFile}`);

  const outputData: WordsInfo = {};

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

        /*
      VER: <= ignore
      SUB: <=
      Telefon Telefon SUB,AKK,SIN,NEU
      Telefon Telefon SUB,DAT,SIN,NEU
      Telefon Telefon SUB,NOM,SIN,NEU
      Telefone Telefon SUB,AKK,PLU,NEU
      Telefone Telefon SUB,GEN,PLU,NEU
      Telefone Telefon SUB,NOM,PLU,NEU
      Telefonen Telefon SUB,DAT,PLU,NEU
      Telefons Telefon SUB,GEN,SIN,NEU

      -	Hehl	SUB:DAT:SIN:MAS
      -	Hehl	SUB:DAT:SIN:NEU
      <= to remove
      */
        if (flexForm != '-' && props[0] === 'SUB' /* && lemma==='Telefon'*/) {
          const propCase: string = props[1];
          const propNumber: string = props[2];
          const propGender: string = props[3];

          // create obj
          if (!outputData[lemma]) {
            outputData[lemma] = {
              DAT: null,
              GEN: null,
              AKK: null,
              NOM: null,
              G: null,
            };
          }

          const wordData: WordInfo = outputData[lemma];

          // gender
          if (propCase === 'NOM' && propNumber === 'SIN') {
            const genderMapping = {
              MAS: 'M',
              FEM: 'F',
              NEU: 'N',
            };
            wordData['G'] = genderMapping[propGender];
          }

          // flex forms
          if (!wordData[propCase]) {
            wordData[propCase] = {};
          }
          wordData[propCase][propNumber] = flexForm;
        }
      })
      .on('close', function (): void {
        outputStream.write(JSON.stringify(outputData));
        console.log(`done, produced: ${outputFile}`);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
