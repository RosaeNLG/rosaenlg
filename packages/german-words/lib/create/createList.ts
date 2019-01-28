import { createInterface, ReadLine } from "readline";
import * as fs from "fs";


function processGermanWords(inputFile: string, outputFile: string) {
  console.log(`starting to process German dictionary file: ${inputFile}`);

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
      */
      if (props[0]=='SUB'/* && lemma=='Telefon'*/) {
        // console.log(`${flexForm} ${lemma} ${props}`);

        const propCase:string = props[1];
        const propNumber:string = props[2];
        const propGender:string = props[3];

        // create obj
        if ( outputData[lemma]==null ) {
          outputData[lemma] = {};
        }

        var wordData = outputData[lemma];

        // gender
        if ( propCase=='NOM' && propNumber=='SIN' ) {
          const genderMapping = {
            'MAS': 'M',
            'FEM': 'F',
            'NEU':'N'
          };
          wordData['G'] = genderMapping[propGender];
        }

        // flex forms
        if (wordData[propCase]==null) {
          wordData[propCase] = {};
        }
        wordData[propCase][propNumber] = flexForm;
      }

    }).on('close', function() {
      // console.log(outputData);

      outputStream.write(JSON.stringify(outputData));
      console.log(`done, produced: ${outputFile}`);
    });
  } catch (err) {
    console.log(err);
  }
}


processGermanWords('resources_src/german-pos-dict/dictionary.dump', 
  'resources_pub/wordsWithGender.json');

