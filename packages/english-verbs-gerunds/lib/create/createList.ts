import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

export function processEnglishGerunds(inputFile: string, outputFile: string, cb: () => void): void {
  console.log('starting to process WordNet: ' + inputFile);

  const gerundsInfo: any = {};

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
        const flex = lineData[0];
        const inf = lineData[1];
        if (flex.endsWith('ing')) {
          // console.log(lineData);
          gerundsInfo[inf] = flex;
        }
      })
      .on('close', function (): void {
        outputStream.write(JSON.stringify(gerundsInfo));
        console.log(`done, produced: ${outputFile}`);
        cb();
      });
  } catch (err) {
    console.log(err);
  }
}
