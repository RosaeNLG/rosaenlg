/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';
import { AAnAsObj } from '../index';

const toAdd = ['armlet'];

export function processEnglishAAn(inputFolder: string, outputFile: string, cb: () => void): void {
  console.log('starting to process WordNet: ' + inputFolder);

  const an: string[] = [];

  //const reGeneral = new RegExp('[^\\w]an \\w+', 'g');
  const reGeneral = /[^\w]an \w+/g;
  const reDetail = /[^\w]an (\w+)/;

  fs.readdir(inputFolder, (_readdirErr, files) => {
    const promises: Promise<void>[] = [];
    for (const file of files) {
      const promise = new Promise<void>((resolve, reject) => {
        const inputFile = inputFolder + '/' + file;

        let count = 0;
        console.log(`start reading file: ${inputFile}...`);
        try {
          const lineReader: ReadLine = createInterface({
            input: fs.createReadStream(inputFile),
          });

          lineReader
            .on('line', function (line: string): void {
              const matched = line.match(reGeneral);
              if (matched) {
                for (const match of matched) {
                  const detail = match.match(reDetail);

                  // keep the case
                  const word = detail[1];
                  if (an.indexOf(word) == -1) {
                    an.push(word);
                  }

                  count++;
                }
              }
            })
            .on('close', function (): void {
              console.log(`${file}: extracted ${count}`);
              resolve();
            });
        } catch (err) {
          console.log(err);
          reject(err);
        }
      });
      promises.push(promise);
    }

    Promise.all(promises).then(function () {
      an.push(...toAdd);
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
      const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);
      const anAsObj: AAnAsObj = {};
      for (const anElt of an) {
        anAsObj[anElt] = 1;
      }
      outputStream.write(JSON.stringify(anAsObj));
      outputStream.close();
      console.log(`done, produced: ${outputFile}`);
      cb();
    });
  });
}
