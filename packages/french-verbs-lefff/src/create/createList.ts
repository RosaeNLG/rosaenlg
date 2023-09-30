/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

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
W infinitif présent

1 1repersonne
2 2epersonne
3 3epersonne
m genre masculin
f genre féeminin
s nombre singulier
p nombre pluriel
*/

import * as fs from 'fs';
import { createInterface, ReadLine } from 'readline';
import { VerbInfo, VerbInfoIndex, VerbsInfo } from '../index';

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

  const parsedCode: ParsedCode = {
    listeTemps: [],
    listePersonne: [],
    listeGenre: [],
    listeNombre: [],
  };

  for (const lettre of code) {
    if (TYPES_TEMPS.indexOf(lettre) > -1) {
      parsedCode.listeTemps.push(lettre);
    } else if (TYPES_PERSONNES.indexOf(lettre) > -1) {
      parsedCode.listePersonne.push(lettre);
    } else if (TYPES_GENRES.indexOf(lettre) > -1) {
      parsedCode.listeGenre.push(lettre);
    } else if (TYPES_NOMBRES.indexOf(lettre) > -1) {
      parsedCode.listeNombre.push(lettre);
    } else {
      console.log('lettre pas reconnue: ' + lettre);
    }
  }

  return parsedCode;
}

function hasGenreNombre(parsedCode: ParsedCode, genre: string, nombre: string): boolean {
  return parsedCode.listeGenre.indexOf(genre) != -1 && parsedCode.listeNombre.indexOf(nombre) != -1;
}

function getPlaceholder(temps: string): (string | null)[] {
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

function fillParticipePresent(placeHolder: (string | null)[], ff: string): void {
  placeHolder[0] = ff;
}

function fillInfinitif(placeHolder: (string | null)[], ff: string): void {
  placeHolder[0] = ff;
}

function fillImperative(placeHolder: (string | null)[], parsedCode: ParsedCode, ff: string): void {
  fillDefault(placeHolder, parsedCode, ff);
  placeHolder[0] = placeHolder[2] = placeHolder[5] = 'NA'; // not null
}

function fillDefault(placeHolder: (string | null)[], parsedCode: ParsedCode, ff: string): void {
  for (const personne of parsedCode.listePersonne) {
    for (const nombre of parsedCode.listeNombre) {
      const indice: number = parseInt(personne) + (nombre === 's' ? 0 : 3) - 1;
      placeHolder[indice] = ff;
    }
  }
}

function fillParticipePasse(placeHolder: (string | null)[], parsedCode: ParsedCode, ff: string): void {
  // participe passé : ms mp fs fp - c'est tout
  if (hasGenreNombre(parsedCode, 'm', 's')) {
    placeHolder[0] = ff;
  }
  if (hasGenreNombre(parsedCode, 'm', 'p')) {
    placeHolder[1] = ff;
  }
  if (hasGenreNombre(parsedCode, 'f', 's')) {
    placeHolder[2] = ff;
  }
  if (hasGenreNombre(parsedCode, 'f', 'p')) {
    placeHolder[3] = ff;
  }

  // [ 'admis', 'v', 'admettre', 'Km' ]
  if (parsedCode.listeNombre.length === 0) {
    if (parsedCode.listeGenre.indexOf('m') != -1) {
      placeHolder[0] = ff;
      placeHolder[1] = ff;
    }
    if (parsedCode.listeGenre.indexOf('f') != -1) {
      placeHolder[2] = ff;
      placeHolder[3] = ff;
    }
  }

  // [ 'autosuffi', 'v', 'autosuffire', 'K' ]
  if (parsedCode.listeNombre.length === 0 && parsedCode.listeGenre.length === 0) {
    placeHolder[0] = ff;
    placeHolder[1] = ff;
    placeHolder[2] = ff;
    placeHolder[3] = ff;
  }
}

function fillOutputData(parsedCode: ParsedCode, verbInfo: VerbInfo, ff: string): void {
  for (const temps of parsedCode.listeTemps) {
    if (!verbInfo[temps as VerbInfoIndex]) {
      verbInfo[temps as VerbInfoIndex] = getPlaceholder(temps);
    }
    const placeHolder = verbInfo[temps as VerbInfoIndex] as (string | null)[];

    switch (temps) {
      case 'K': {
        fillParticipePasse(placeHolder, parsedCode, ff);
        break;
      }
      case 'G': {
        fillParticipePresent(placeHolder, ff);
        break;
      }
      case 'W': {
        fillInfinitif(placeHolder, ff);
        break;
      }
      case 'Y': {
        fillImperative(placeHolder, parsedCode, ff);
        break;
      }
      default: {
        fillDefault(placeHolder, parsedCode, ff);
      }
    }
  }
}

export function processFrenchVerbs(inputFile: string, outputFile: string, cb: () => void): void {
  console.log('starting to process LEFFF file: ' + inputFile);

  const verbsInfo: VerbsInfo = {};

  try {
    const lineReader: ReadLine = createInterface({
      input: fs.createReadStream(inputFile),
    });

    const outputStream: fs.WriteStream = fs.createWriteStream(outputFile);

    lineReader
      .on('line', function (line: string): void {
        const lineData: string[] = line.split('\t');

        if (lineData[1] === 'v') {
          const ff: string = lineData[0];
          const inf: string = lineData[2];
          const code: string = lineData[3];

          // ignore list
          if (!(inf === '_error' || (inf === 'être' && code === 'P3p' && ff === 'st'))) {
            const parsedCode: ParsedCode = parseCode(code);

            if (!verbsInfo[inf]) {
              verbsInfo[inf] = {
                P: undefined,
                S: undefined,
                Y: undefined,
                I: undefined,
                G: undefined,
                K: undefined,
                J: undefined,
                T: undefined,
                F: undefined,
                C: undefined,
                W: undefined,
              };
            }

            fillOutputData(parsedCode, verbsInfo[inf], ff);
          }
        }
      })
      .on('close', function (): void {
        // vouloir impératif
        verbsInfo['vouloir'] = {
          ...verbsInfo['vouloir'],
          Y: ['NA', 'veuille', 'NA', 'veuillons', 'veuillez', 'NA'],
        };

        outputStream.write(JSON.stringify(verbsInfo));
        console.log(`done, produced: ${outputFile}`);
        cb();
      });
  } catch (err) {
    console.log(err);
  }
}
