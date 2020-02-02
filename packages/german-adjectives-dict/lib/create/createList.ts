import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

export function processGermanAdjectives(inputFile: string, outputFile: string, cb: Function): void {
  console.log(`starting to process German dictionary file: ${inputFile} for adjectives`);

  const adjectivesInfo: any = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile),
    });

    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function(line: string): void {
        const lineData: string[] = line.split('\t');
        const flexForm: string = lineData[0];
        const lemma: string = lineData[1];
        const props: string[] = lineData[2].split(':');

        const type = props[0];
        /*
      GRU: alten altem etc.
      KOM: älteres
      SUP: ältesten
      */
        if ((type === 'ADJ' || type === 'PA1' || type === 'PA2') && props[4] === 'GRU' /* && lemma=='alt' */) {
          // debug(`${flexForm} ${lemma} ${props}`);

          const propCase: string = props[1];
          const propNumber: string = props[2];
          const propGender: string = props[3];
          const propArt: string = props[5];

          // create obj
          if (!adjectivesInfo[lemma]) {
            adjectivesInfo[lemma] = {
              AKK: null,
              DAT: null,
              GEN: null,
              NOM: null,
            };
          }
          const adjectiveInfo: any = adjectivesInfo[lemma];

          if (!adjectiveInfo[propCase]) {
            adjectiveInfo[propCase] = {
              DEF: null,
              IND: null,
              SOL: null,
            };
          }
          const adjectiveInfoCase: any = adjectiveInfo[propCase];

          if (!adjectiveInfoCase[propArt]) {
            adjectiveInfoCase[propArt] = {
              P: null,
              M: null,
              F: null,
              N: null,
            };
          }
          const adjectiveGenderInfo: any = adjectiveInfoCase[propArt];

          if (propNumber === 'SIN') {
            const genderMapping = {
              MAS: 'M',
              FEM: 'F',
              NEU: 'N',
            };
            adjectiveGenderInfo[genderMapping[propGender]] = flexForm;
          } else {
            // 'PLU' we assume it's all the same, does not depend on gender
            adjectiveGenderInfo['P'] = flexForm;
          }
        }
      })
      .on('close', function(): void {
        // debug(adjectivesInfo);

        outputStream.write(JSON.stringify(adjectivesInfo));
        console.log('done, produced: ' + outputFile);
        cb();
      });
  } catch (err) {
    console.log(err);
    cb();
  }
}
