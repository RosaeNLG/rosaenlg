/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

const toAdd = ['armlet'];

export function processEnglishAAn(inputFolder: string, outputFile: string, cb: () => void): void {
  console.log('starting to process WordNet: ' + inputFolder);

  const an: string[] = [];

  const reGeneral = new RegExp('[^\\w]an [\\w]+', 'g');
  const reDetail = new RegExp('[^\\w]an ([\\w]+)');

  fs.readdir(inputFolder, (_readdirErr, files) => {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < files.length; i++) {
      const promise = new Promise<void>((resolve, reject) => {
        const file = files[i];
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
                for (let j = 0; j < matched.length; j++) {
                  const detail = matched[j].match(reDetail);

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
      const anAsObj = {};
      for (let k = 0; k < an.length; k++) {
        anAsObj[an[k]] = 1;
      }
      outputStream.write(JSON.stringify(anAsObj));
      outputStream.close();
      //console.log(an);
      console.log(`done, produced: ${outputFile}`);
      cb();
    });
  });
}
