/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { isHAspire } from 'french-contractions';

export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type Persons = 1 | 2 | 3;
export type DetType = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';

// "des jeunes gens", not "de jeunes gens"
const desExceptions = ['jeunes gens'];

type getDetParameters = {
  detType: DetType;
  genderOwned?: Genders | null;
  numberOwned?: Numbers | null;
  numberOwner?: Numbers | null;
  personOwner?: Persons | null;
  adjectiveAfterDet?: boolean | null;
  contentAfterDet?: string;
  forceDes?: boolean | null;
};

/* 
  ma, ta, sa deviennent mon, ton, son devant des noms féminins commençant par une voyelle pour éviter le hiatus de deux voyelles. 
  a priori, ce n'est pas le cas avec y: par exemple ma yogourtière
  https://open.byu.edu/grammaire_ouverte/determinants#:~:text=N'oubliez%20pas%20de%20faire,le%20hiatus%20de%20deux%20voyelles.
*/

const wowelStart = 'aAeEiIoOuUàáâãäåÀÁÂèéêëÈÉÊËìíîïÌÍÎÏòóôõöøÒÓÔÕÖØùúûüÙÚÛÜ'.split('');
const hMuetStart = 'aAeEiIoOuUyYàáâãäåÀÁÂèéêëÈÉÊËìíîïÌÍÎÏòóôõöøÒÓÔÕÖØùúûüÙÚÛÜ'.split('').map((letter) => 'h' + letter);
const hiatusStarts = [...wowelStart, ...hMuetStart];

function mustFixHiatus(contentAfterDet: string | undefined) {
  if (!contentAfterDet) {
    return false;
  }
  const trimmedContent = contentAfterDet.split(' ')[0].trim();

  if (isHAspire(trimmedContent)) {
    return false;
  }

  const mustHiatus = hiatusStarts.some((item) => trimmedContent.startsWith(item));

  return mustHiatus;
}

export function getDet({
  detType,
  genderOwned,
  numberOwned,
  numberOwner,
  adjectiveAfterDet,
  contentAfterDet,
  forceDes,
  personOwner,
}: getDetParameters): string | undefined {
  if (detType != 'DEFINITE' && detType != 'INDEFINITE' && detType != 'DEMONSTRATIVE' && detType != 'POSSESSIVE') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `unsuported determiner type: ${detType})`;
    throw err;
  }

  if (detType === 'POSSESSIVE' && numberOwner != 'S' && numberOwner != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `numberOwner must be S or P when possessive`;
    throw err;
  }

  if (detType === 'POSSESSIVE' && personOwner != 1 && personOwner != 2 && personOwner != 3) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `personOwner must be 1, 2 or 3 when possessive`;
    throw err;
  }

  if (genderOwned != 'M' && genderOwned != 'F' && numberOwned != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M or F (unless plural)`;
    throw err;
  }

  if (numberOwned != 'S' && numberOwned != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (detType != 'POSSESSIVE') {
    if (detType === 'INDEFINITE' && numberOwned === 'P' && adjectiveAfterDet) {
      const cleanedAfter = contentAfterDet ? contentAfterDet.trim() : '';
      return desExceptions.includes(cleanedAfter) || forceDes ? 'des' : 'de';
    } else {
      const frenchDets = {
        DEFINITE: { M: 'le', F: 'la', P: 'les' },
        INDEFINITE: { M: 'un', F: 'une', P: 'des' },
        DEMONSTRATIVE: { M: 'ce', F: 'cette', P: 'ces' },
      };

      if (numberOwned === 'P') {
        return frenchDets[detType]['P'];
      } else {
        return frenchDets[detType][genderOwned as Genders];
      }
    }
  } else {
    /*
      Demande à Nicolas de rentrer son ballon et ses patins.
      Demande à Nicolas et à Cédric de rentrer leur ballon et leurs patins.
      https://www.francaisfacile.com/exercices/exercice-francais-2/exercice-francais-42144.php
    */

    switch (personOwner) {
      case 1: {
        switch (numberOwner) {
          case 'S': {
            switch (numberOwned) {
              case 'S': {
                switch (genderOwned) {
                  case 'M': {
                    return 'mon';
                  }
                  case 'F': {
                    return mustFixHiatus(contentAfterDet) ? 'mon' : 'ma';
                  }
                }
              }
              case 'P': {
                return 'mes';
              }
            }
          }
          case 'P': {
            switch (numberOwned) {
              case 'S': {
                return 'notre';
              }
              case 'P': {
                return 'nos';
              }
            }
          }
        }
      }
      case 2: {
        switch (numberOwner) {
          case 'S': {
            switch (numberOwned) {
              case 'S': {
                switch (genderOwned) {
                  case 'M': {
                    return 'ton';
                  }
                  case 'F': {
                    return mustFixHiatus(contentAfterDet) ? 'ton' : 'ta';
                  }
                }
              }
              case 'P': {
                return 'tes';
              }
            }
          }
          case 'P': {
            switch (numberOwned) {
              case 'S': {
                return 'votre';
              }
              case 'P': {
                return 'vos';
              }
            }
          }
        }
      }
      case 3: {
        switch (numberOwner) {
          case 'S': {
            switch (numberOwned) {
              case 'S': {
                switch (genderOwned) {
                  case 'M': {
                    return 'son';
                  }
                  case 'F': {
                    return mustFixHiatus(contentAfterDet) ? 'son' : 'sa';
                  }
                }
              }
              case 'P': {
                return 'ses';
              }
            }
          }
          case 'P': {
            switch (numberOwned) {
              case 'S': {
                return 'leur';
              }
              case 'P': {
                return 'leurs';
              }
            }
          }
        }
      }
    }
  }
}
