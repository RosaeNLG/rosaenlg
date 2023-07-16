/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type Genders = 'M' | 'F' | 'N';
export type Numbers = 'S' | 'P';
export type DetType = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';
export type Dist = 'PROXIMAL' | 'MEDIAL' | 'DISTAL';

const stressedAList = [
  'agua',
  'alma',
  'águila',
  'arma',
  'ala',
  'asta',
  'hambre',
  'arca',
  'arpa',
  'asma',
  'álgebra',
  'acta',
  'alba',
  'alga',
  'alma',
  'aspa',
  'aula',
  'ave',
  'hacha',
  'hada',
  'hambre',
  'ama',
  'hampa',
];

function isStressedA(after: string | undefined): boolean {
  if (after != null) {
    const cleanedAfter = after.replace(/¤/g, ' ').trim().toLowerCase();
    if (cleanedAfter === 'azúcar') {
      return true;
    }
    if (stressedAList.includes(cleanedAfter)) {
      return true;
    }
    return false;
  }
  return false;
}

export function getDet(
  detType: DetType,
  gender: Genders | undefined,
  number: Numbers | undefined,
  after: string | undefined,
  dist: Dist | undefined,
): string {
  if (detType != 'DEFINITE' && detType != 'INDEFINITE' && detType != 'DEMONSTRATIVE' && detType != 'POSSESSIVE') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `unsuported determiner type: ${detType})`;
    throw err;
  }

  if (detType == 'DEMONSTRATIVE' && dist != null && dist != 'PROXIMAL' && dist != 'MEDIAL' && dist != 'DISTAL') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `unsupported distance: must be PROXIMAL MEDIAL or DISTAL, here ${dist}`;
    throw err;
  }

  if (gender != 'M' && gender != 'F' && gender != 'N') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M F or N`;
    throw err;
  }

  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (gender == 'N') {
    if (detType === 'DEMONSTRATIVE') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `neutral not possible when demonstrative`;
      throw err;
    }

    if (number == 'P') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no neutral plural!`;
      throw err;
    }
  }

  switch (detType) {
    case 'DEFINITE':
    case 'INDEFINITE': {
      let forceM = false;
      const detTable: { [index: string]: { [index: string]: { [index: string]: string } } } = {
        // nice, nice!
        DEFINITE: { S: { M: 'el', F: 'la', N: 'lo' }, P: { M: 'los', F: 'las' } },
        INDEFINITE: { S: { M: 'un', F: 'una', N: 'uno' }, P: { M: 'unos', F: 'unas' } },
      };
      if (gender == 'F' && number == 'S' && isStressedA(after)) {
        forceM = true;
      }

      return detTable[detType][number][forceM ? 'M' : gender];
    }
    case 'DEMONSTRATIVE': {
      const detTable: { [index: string]: { [index: string]: { [index: string]: string } } } = {
        PROXIMAL: {
          S: { M: 'este', F: 'esta' },
          P: { M: 'estos', F: 'estas' },
        },
        MEDIAL: {
          S: { M: 'ese', F: 'esa' },
          P: { M: 'esos', F: 'esas' },
        },
        DISTAL: {
          S: { M: 'aquel', F: 'aquella' },
          P: { M: 'aquellos', F: 'aquellas' },
        },
      };
      return detTable[dist || 'PROXIMAL'][number][gender];
    }
    case 'POSSESSIVE': {
      switch (number) {
        case 'S': {
          return 'su';
        }
        case 'P': {
          return 'sus';
        }
      }
    }
  }
}
