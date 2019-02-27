/*
  reads the LEFFF and produces a list of the French verbs with their conjugations

impératif Y : NA lorsque pas de sens
null lorsque pas dispo / pas de sens

P indicatif présent
F indicatif futur
I indicatif imparfait
J indicatif passé-simple
C conditionnel présent
Y imperatif présent
S subjonctif présent
T subjonctif imparfait
K participe passé
G participe présent
W infinitif présent

1 1repersonne
2 2epersonne
3 3epersonne
m genre masculin
f genre féeminin
s nombre singulier
p nombre pluriel
*/

import { createInterface, ReadLine } from "readline";
import * as fs from "fs"

import * as Debug from "debug";
const debug = Debug("french-verbs");

function getPlaceholder(temps:string):string[] {
  if (temps=='Y') { // impératif
    return ['NA', null, 'NA', null, null, 'NA'];
  } else if (temps=='K') { // participe passé
    return [null, null, null, null];
  } else if (temps=='G') { // participe présent
    return [null];
  } else if (temps=='W') { // infinitif
    return [null];
  } else { // cas général
    return [null, null, null, null, null, null];
  }  
}

function parseCode(code:string): {
  'liste_temps':string[], 
  'liste_personne':string[], 
  'liste_genre':string[], 
  'liste_nombre': string[]} {

  const TYPES_TEMPS:string = 'PFIJCYSTKGW';
  const TYPES_PERSONNES:string = '123';
  const TYPES_GENRES:string = 'mf';
  const TYPES_NOMBRES:string = 'sp';

  var res = {
    'liste_temps':[],
    'liste_personne':[],
    'liste_genre':[],
    'liste_nombre':[]
  };

  for (var i=0; i<code.length; i++) {
    var lettre = code[i];
    if ( TYPES_TEMPS.indexOf(lettre)>-1 ) {
      res['liste_temps'].push(lettre);
    } else if ( TYPES_PERSONNES.indexOf(lettre)>-1 ) {
      res['liste_personne'].push(lettre);
    } else if (TYPES_GENRES.indexOf(lettre)>-1) {
      res['liste_genre'].push(lettre);
    } else if (TYPES_NOMBRES.indexOf(lettre)>-1) {
      res['liste_nombre'].push(lettre);
    } else {
      console.log("lettre pas reconnue: " + lettre);
    }
  }
    
  return res;
}

function fillOutputData(parsedCode:any, verbData:any, ff:string):void {
  for (var i=0; i<parsedCode.liste_temps.length; i++) {
    const temps:string = parsedCode.liste_temps[i];

    if ( verbData[temps]==null ) {
      verbData[temps] = getPlaceholder(temps);
    }

    if (temps=='K') { // participe passé : ms mp fs fp - c'est tout
      function hasGenreNombre(genre:string, nombre:string):boolean {
        return parsedCode.liste_genre.indexOf(genre)!=-1 && parsedCode.liste_nombre.indexOf(nombre)!=-1;
      }
      if (hasGenreNombre('m','s')) { verbData[temps][0] = ff; }
      if (hasGenreNombre('m','p')) { verbData[temps][1] = ff; }
      if (hasGenreNombre('f','s')) { verbData[temps][2] = ff; }
      if (hasGenreNombre('f','p')) { verbData[temps][3] = ff; }

      // [ 'admis', 'v', 'admettre', 'Km' ]
      if ( parsedCode.liste_nombre.length==0 ) {
        if ( parsedCode.liste_genre.indexOf('m')!=-1 ) {
          verbData[temps][0] = ff;
          verbData[temps][1] = ff;
        }
        if ( parsedCode.liste_genre.indexOf('f')!=-1 ) {
          verbData[temps][2] = ff;
          verbData[temps][3] = ff;
        }
      }

      // [ 'autosuffi', 'v', 'autosuffire', 'K' ]
      if ( parsedCode.liste_nombre.length==0 &&  parsedCode.liste_genre.length==0 ) {
        verbData[temps][0] = ff;
        verbData[temps][1] = ff;
        verbData[temps][2] = ff;
        verbData[temps][3] = ff;
      }

    } else if (temps=='G') { // participe présent
      verbData[temps][0] = ff;
    } else if (temps=='W') { // infinitif
      verbData[temps][0] = ff;
    } else { // cas général
      for (var j=0; j<parsedCode.liste_personne.length; j++) {
        const personne:string = parsedCode.liste_personne[j];

        for (var k=0; k<parsedCode.liste_nombre.length; k++) {
          const nombre:string = parsedCode.liste_nombre[k];
          const indice:number = parseInt(personne) + ( nombre=='s' ? 0 : 3 ) - 1;
          //debug(`${inf} ${temps} ${indice} = ${ff}` );
          verbData[temps][indice] = ff;
        }
      }  
    }
  }
}


function processFrenchVerbs(inputFile:string, outputFile:string):void {
  console.log("starting to process LEFFF file: " + inputFile);

  let outputData = {};

  try {
    var lineReader:ReadLine = createInterface({
      input: fs.createReadStream(inputFile)
    });

    if (fs.existsSync(outputFile)) { fs.unlinkSync(outputFile); }
    var outputStream:fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader.on('line', function (line:string):void {
      const lineData:string[] = line.split('\t');

      if (lineData[1]=='v') {

        const ff:string = lineData[0];
        const inf:string = lineData[2];
        const code:string = lineData[3];

        function toIgnore() {
          if (inf=='_error') { return true; }
          if (inf=='être' && code=='P3p' && ff=='st') { return true; }
          return false;
        }

        if (!toIgnore() /* && inf=='boire' */) {

          debug(lineData);

          var parsedCode:any = parseCode(code);

          if ( outputData[inf]==null ) {
            outputData[inf] = {};
          }

          fillOutputData(parsedCode, outputData[inf], ff);
        }
      }

    }).on('close', function() {
      outputStream.write(JSON.stringify(outputData));
      console.log(`done, produced: ${outputFile}`);
    });
  } catch (err) {
    console.log(err);
  }
}
 
processFrenchVerbs('resources_src/lefff-3.4.mlex/lefff-3.4.mlex', 
  'resources_pub/conjugation/conjugations.json');
 