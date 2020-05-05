import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

export function processItalianWords(inputFile: string, outputFile: string, cb: Function): void {
  console.log(`starting to process Italian resource file: ${inputFile} for words`);

  const wordsInfo: any = {};

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
        const lemma: string = lineData[1];
        const props: string[] = lineData[2].split(':');
        if (props.length != 2) {
          return;
        }
        const derivational: string[] = props[0].split('-');
        const inflectional: string[] = props[1].split('+');

        if (
          derivational.length >= 1 &&
          derivational[0] === 'NOUN'
          // && lemma === 'cameriere'
        ) {
          //console.log(`${flexForm} ${lemma} ${inflectional}`);

          let gender: 'M' | 'F';
          if (derivational.indexOf('M') > -1) {
            gender = 'M';
          } else if (derivational.indexOf('F') > -1) {
            gender = 'F';
          } else {
            console.log(`${line} has no gender!`);
          }

          let number: 'S' | 'P';
          if (inflectional.indexOf('s') > -1) {
            number = 'S';
          } else if (inflectional.indexOf('p') > -1) {
            number = 'P';
          } else {
            console.log(`${line} has no number!`);
          }

          // create obj
          if (!wordsInfo[lemma]) {
            wordsInfo[lemma] = {
              G: null,
              S: null,
              P: null,
            };
          }
          const wordInfo: any = wordsInfo[lemma];
          wordInfo.G = gender;
          wordInfo[number] = flexForm;
        }
      })
      .on('close', function (): void {
        const keys = Object.keys(wordsInfo);
        for (let i = 0; i < keys.length; i++) {
          const wordInfo = wordsInfo[keys[i]];
          if (wordInfo['S'] == keys[i]) {
            delete wordInfo['S'];
          } else {
            // in practice not always equal: there are errors, and plural only words like alimentari
            // console.log(`invalid: ${keys[i]} => ${JSON.stringify(wordInfo)}`);
          }
        }
        outputStream.write(JSON.stringify(wordsInfo));
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
