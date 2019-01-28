/*
  reads the LEFFF and produces a list of the French words with their gender

  Certains noms ont un double genre (masculin et féminin)
    architecte	nc	architecte	s
  => on ne les prends pas

  Quelques noms dont le sens diffère selon qu'ils sont masculins ou féminins
    cartouche	nc	cartouche	s
  => on ne les prends pas

  Les pluriels : 
    pétales	nc	pétale	mp
  => on ne les prends pas

  On prend tous les nc avec m ou f puis pas p
    poids	nc	poids	m <= oui
    couleur	nc	couleur	fs <= oui
    pétale	nc	pétale	ms <= oui
*/

import { createInterface, ReadLine } from "readline";
import * as fs from "fs"

function processFrenchWords(inputFile:string, outputFile:string):void {
  console.log(`starting to process LEFFF file: ${inputFile}`);

  var outputData:any = {};

  try {
    var lineReader:ReadLine = createInterface({
      input: fs.createReadStream(inputFile)
    });

    if (fs.existsSync(outputFile)) { fs.unlinkSync(outputFile); }
    var outputStream:fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader.on('line', function (line:string):void {
      const lineData:string[] = line.split('\t');
      if (lineData[1]=='nc' && ['fs','ms','m'].indexOf(lineData[3])!=-1) {
        outputData[ lineData[0] ] = lineData[3][0].toUpperCase();
      }

    }).on('close', function() {
      outputStream.write(JSON.stringify(outputData));
      console.log(`done, produced: ${outputFile}`);
    });
  } catch (err) {
    console.log(err);
  }
}


processFrenchWords('resources_src/lefff-3.4.mlex/lefff-3.4.mlex', 
  'resources_pub/wordsWithGender.json');

