import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

import { WordsInfo, WordInfo } from '../index';

function processItalianWords(inputFile: string, outputFile: string): void {
  console.log(`starting to process Italian resource file: ${inputFile} for words`);

  let wordsInfo: WordsInfo = {};

  try {
    let lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile, { encoding: 'latin1' }),
    });

    let outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function(line: string): void {
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
          let wordInfo: WordInfo = wordsInfo[lemma];
          wordInfo.G = gender;
          wordInfo[number] = flexForm;
        }
      })
      .on('close', function(): void {
        //console.log(wordsInfo);
        /*
        let keys = Object.keys(wordsInfo);
        for (let i=0; i<keys.length; i++) {
          let wordInfo = wordsInfo[ keys[i] ];
          if (!wordInfo.G || !wordInfo.S || !wordInfo.P) {
            console.log(`${keys[i]} => ${JSON.stringify(wordInfo)} has incomplete data!`);
          }
        }
        */

        outputStream.write(JSON.stringify(wordsInfo));
        console.log('done, produced: ' + outputFile);
      });
  } catch (err) {
    console.log(err);
  }
}

processItalianWords('resources_src/morph-it/morph-it_048.txt', 'resources_pub/words.json');
