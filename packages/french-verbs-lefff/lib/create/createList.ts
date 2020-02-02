/*
  reads the LEFFF and produces a list of the French verbs with their conjugations

impératif Y : NA lorsque pas de sens
null lorsque pas dispo / pas de sens

P indicatif présent
F indicatif futur
I indicatif imparfait
J indicatif passé-simple
C conditionnel présent
Y impératif présent
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

import { createInterface, ReadLine } from 'readline';
import * as fs from 'fs';

//import * as Debug from 'debug';
//const debug = Debug('french-verbs');

function getPlaceholder(temps: string): string[] {
  if (temps === 'Y') {
    // impératif
    return ['NA', null, 'NA', null, null, 'NA'];
  } else if (temps === 'K') {
    // participe passé
    return [null, null, null, null];
  } else if (temps === 'G') {
    // participe présent
    return [null];
  } else if (temps === 'W') {
    // infinitif
    return [null];
  } else {
    // cas général
    return [null, null, null, null, null, null];
  }
}

interface ParsedCode {
  listeTemps: string[];
  listePersonne: string[];
  listeGenre: string[];
  listeNombre: string[];
}

function parseCode(code: string): ParsedCode {
  const TYPES_TEMPS = 'PFIJCYSTKGW';
  const TYPES_PERSONNES = '123';
  const TYPES_GENRES = 'mf';
  const TYPES_NOMBRES = 'sp';

  const parsedCode = {
    listeTemps: [],
    listePersonne: [],
    listeGenre: [],
    listeNombre: [],
  };

  for (let i = 0; i < code.length; i++) {
    const lettre = code[i];
    if (TYPES_TEMPS.indexOf(lettre) > -1) {
      parsedCode['listeTemps'].push(lettre);
    } else if (TYPES_PERSONNES.indexOf(lettre) > -1) {
      parsedCode['listePersonne'].push(lettre);
    } else if (TYPES_GENRES.indexOf(lettre) > -1) {
      parsedCode['listeGenre'].push(lettre);
    } else if (TYPES_NOMBRES.indexOf(lettre) > -1) {
      parsedCode['listeNombre'].push(lettre);
    } else {
      console.log('lettre pas reconnue: ' + lettre);
    }
  }

  return parsedCode;
}

function hasGenreNombre(parsedCode: ParsedCode, genre: string, nombre: string): boolean {
  return parsedCode.listeGenre.indexOf(genre) != -1 && parsedCode.listeNombre.indexOf(nombre) != -1;
}

function fillOutputData(parsedCode: ParsedCode, verbInfo: any, ff: string): void {
  for (let i = 0; i < parsedCode.listeTemps.length; i++) {
    const temps: string = parsedCode.listeTemps[i];

    if (!verbInfo[temps]) {
      verbInfo[temps] = getPlaceholder(temps);
    }

    if (temps === 'K') {
      // participe passé : ms mp fs fp - c'est tout
      if (hasGenreNombre(parsedCode, 'm', 's')) {
        verbInfo[temps][0] = ff;
      }
      if (hasGenreNombre(parsedCode, 'm', 'p')) {
        verbInfo[temps][1] = ff;
      }
      if (hasGenreNombre(parsedCode, 'f', 's')) {
        verbInfo[temps][2] = ff;
      }
      if (hasGenreNombre(parsedCode, 'f', 'p')) {
        verbInfo[temps][3] = ff;
      }

      // [ 'admis', 'v', 'admettre', 'Km' ]
      if (parsedCode.listeNombre.length === 0) {
        if (parsedCode.listeGenre.indexOf('m') != -1) {
          verbInfo[temps][0] = ff;
          verbInfo[temps][1] = ff;
        }
        if (parsedCode.listeGenre.indexOf('f') != -1) {
          verbInfo[temps][2] = ff;
          verbInfo[temps][3] = ff;
        }
      }

      // [ 'autosuffi', 'v', 'autosuffire', 'K' ]
      if (parsedCode.listeNombre.length === 0 && parsedCode.listeGenre.length === 0) {
        verbInfo[temps][0] = ff;
        verbInfo[temps][1] = ff;
        verbInfo[temps][2] = ff;
        verbInfo[temps][3] = ff;
      }
    } else if (temps === 'G') {
      // participe présent
      verbInfo[temps][0] = ff;
    } else if (temps === 'W') {
      // infinitif
      verbInfo[temps][0] = ff;
    } else {
      // cas général
      for (let j = 0; j < parsedCode.listePersonne.length; j++) {
        const personne: string = parsedCode.listePersonne[j];

        for (let k = 0; k < parsedCode.listeNombre.length; k++) {
          const nombre: string = parsedCode.listeNombre[k];
          const indice: number = parseInt(personne) + (nombre === 's' ? 0 : 3) - 1;
          //// debug(`${inf} ${temps} ${indice} = ${ff}` );
          verbInfo[temps][indice] = ff;
        }
      }
    }
  }
}

export function processFrenchVerbs(inputFile: string, outputFile: string, cb: Function): void {
  console.log('starting to process LEFFF file: ' + inputFile);

  const verbsInfo: any = {};

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

        if (lineData[1] === 'v') {
          const ff: string = lineData[0];
          const inf: string = lineData[2];
          const code: string = lineData[3];

          let ignore = false;
          if (inf === '_error') {
            ignore = true;
          } else if (inf === 'être' && code === 'P3p' && ff === 'st') {
            ignore = true;
          }

          if (!ignore /* && inf=='boire' */) {
            // debug(lineData);

            const parsedCode: ParsedCode = parseCode(code);

            if (!verbsInfo[inf]) {
              verbsInfo[inf] = {
                P: null,
                S: null,
                Y: null,
                I: null,
                G: null,
                K: null,
                J: null,
                T: null,
                F: null,
                C: null,
                W: null,
              };
            }

            fillOutputData(parsedCode, verbsInfo[inf], ff);
          }
        }
      })
      .on('close', function(): void {
        outputStream.write(JSON.stringify(verbsInfo));
        console.log(`done, produced: ${outputFile}`);
        cb();
      });
  } catch (err) {
    console.log(err);
  }
}
