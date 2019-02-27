import { createInterface, ReadLine } from "readline";
import * as fs from "fs"

import * as Debug from "debug";
const debug = Debug("german-adjectives");

function processGermanAdjectives(inputFile:string, outputFile:string):void {
  console.log(`starting to process German dictionary file: ${inputFile} for adjectives`);

  let outputData: any = {};

  try {
    var lineReader:ReadLine = createInterface({
      input: fs.createReadStream(inputFile)
    });

    if (fs.existsSync(outputFile)) { fs.unlinkSync(outputFile); }
    var outputStream:fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader.on('line', function (line:string):void {
      const lineData:string[] = line.split('\t');
      const flexForm:string = lineData[0];
      const lemma:string = lineData[1];
      const props:string[] = lineData[2].split(':');

      /*
      GRU: alten altem etc.
      KOM: älteres
      SUP: ältesten
      */
      if (props[0]=='ADJ' && props[4]=='GRU' /* && lemma=='alt' */) {
        
        debug(`${flexForm} ${lemma} ${props}`);

        const propCase:string = props[1];
        const propNumber:string = props[2];
        const propGender:string = props[3];
        const propArt:string = props[5];

        // create obj
        if ( outputData[lemma]==null ) {
          outputData[lemma] = {};
        }
        var wordData = outputData[lemma];

        if (wordData[propCase]==null) {
          wordData[propCase] = {};
        }
        var wordDataCase:any = wordData[propCase];

        if (wordDataCase[propArt]==null) {
          wordDataCase[propArt] = {};
        }
        var wordDataCaseArt:any = wordDataCase[propArt];
        
        if (propNumber=='SIN') {
          const genderMapping = {
            'MAS': 'M',
            'FEM': 'F',
            'NEU':'N'
          };
          wordDataCaseArt[ genderMapping[propGender] ] = flexForm;
        } else { // 'PLU' we assume it's all the same, does not depend on gender
          wordDataCaseArt['P'] = flexForm;
        }


      }
      

    }).on('close', function() {
      debug(outputData);

      outputStream.write(JSON.stringify(outputData));
      console.log("done, produced: " + outputFile);
    });
  } catch (err) {
    console.log(err);
  }
}


processGermanAdjectives('resources_src/german-pos-dict/dictionary.dump', 
  'resources_pub/adjectives.json');
