/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

export function processEnglishPlurals(inputFile: string, outputFile: string, cb: () => void): void {
  console.log('starting to process WordNet: ' + inputFile);

  const plurals: any = {};

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
        const lineData: string[] = line.split(' ');
        const plural = lineData[0];
        const singular = lineData[1];
        plurals[singular] = plural;
      })
      .on('close', function (): void {
        // brother -> brethren to remove...
        delete plurals.brother;
        outputStream.write(JSON.stringify(plurals));
        console.log(`done, produced: ${outputFile}`);
        cb();
      });
  } catch (err) {
    console.log(err);
  }
}
