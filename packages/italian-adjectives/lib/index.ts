/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommonItalian, buildLanguageCommon } from 'rosaenlg-commons';

import { AdjectivesInfo, AdjectiveInfo } from 'italian-adjectives-dict';
export { AdjectivesInfo, AdjectiveInfo } from 'italian-adjectives-dict';

export function getAdjectiveInfo(adjList: AdjectivesInfo, adjective: string): AdjectiveInfo {
  if (!adjList) {
    const errNoList = new Error();
    errNoList.name = 'InvalidArgumentError';
    errNoList.message = `adjective list must not be null`;
    throw errNoList;
  }

  const irregularAfter: AdjectivesInfo = {
    bello: { MP: 'belli', FS: 'bella', FP: 'belle' },
    buono: { MP: 'buoni', FS: 'buona', FP: 'buone' },
    grande: { MP: 'grandi', FS: 'grande', FP: 'grandi' },
    santo: { MP: 'santi', FS: 'santa', FP: 'sante' },
  };

  if (adjList[adjective]) {
    return adjList[adjective];
  } else if (irregularAfter[adjective]) {
    return irregularAfter[adjective];
  }

  const errNotFound = new Error();
  errNotFound.name = 'NotFoundInDict';
  errNotFound.message = `${adjective} was not found in adjective list`;
  throw errNotFound;
}

export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';

function isIrregular(adjective: string): boolean {
  const irregulars = ['bello', 'buono', 'grande', 'santo'];
  if (irregulars.indexOf(adjective.toLowerCase()) > -1) {
    return true;
  } else {
    return false;
  }
}

// MS FS MP FP
const possessives = {
  mio: { FS: 'mia', MP: 'miei', FP: 'mie' },
  tuo: { FS: 'tua', MP: 'tuoi', FP: 'tue' },
  suo: { FS: 'sua', MP: 'suoi', FP: 'sue' },
  Suo: { FS: 'Sua', MP: 'Suoi', FP: 'Sue' },
  nostro: { FS: 'nostra', MP: 'nostri', FP: 'nostre' },
  vostro: { FS: 'vostra', MP: 'vostri', FP: 'vostre' },
  loro: { FS: 'loro', MP: 'loro', FP: 'loro' },
};
function isPossessive(adjective: string): boolean {
  return Object.keys(possessives).indexOf(adjective) > -1;
}
function getPossessive(adjective: string, gender: Genders, number: Numbers): string {
  if (gender === 'M' && number === 'S') {
    return adjective;
  } else {
    return possessives[adjective][gender + number];
  }
}

const languageCommonItalian: LanguageCommonItalian = buildLanguageCommon('it') as LanguageCommonItalian;

function getIrregularBeforeNoun(adjective: string, gender: Genders, number: Numbers, noun: string): string {
  // http://www.arnix.it/free-italian/italian-grammar/adjectives-irregular-in-italian.php
  switch (adjective.toLowerCase()) {
    case 'bello': {
      if (gender === 'M') {
        if (languageCommonItalian.startsWithVowel(noun)) {
          if (number === 'S') {
            return "bell'";
          } else {
            return 'begli';
          }
        } else if (languageCommonItalian.isConsonneImpure(noun) || languageCommonItalian.isIFollowedByVowel(noun)) {
          if (number === 'S') {
            return 'bello';
          } else {
            return 'begli';
          }
        } else {
          if (number === 'S') {
            return 'bel';
          } else {
            return 'bei';
          }
        }
      } else {
        if (languageCommonItalian.startsWithVowel(noun)) {
          if (number === 'S') {
            return "bell'";
          } else {
            return 'belle';
          }
        } else {
          if (number === 'S') {
            return 'bella';
          } else {
            return 'belle';
          }
        }
      }
    }
    case 'buono': {
      if (gender === 'M') {
        if (languageCommonItalian.isConsonneImpure(noun) || languageCommonItalian.isIFollowedByVowel(noun)) {
          if (number === 'S') {
            return 'buono';
          } else {
            return 'buoni';
          }
        } else {
          if (number === 'S') {
            return 'buon';
          } else {
            return 'buoni';
          }
        }
      } else {
        if (languageCommonItalian.startsWithVowel(noun)) {
          if (number === 'S') {
            return "buon'";
          } else {
            return 'buone';
          }
        } else {
          if (number === 'S') {
            return 'buona';
          } else {
            return 'buone';
          }
        }
      }
    }
    case 'grande': {
      if (number === 'P') {
        return 'grandi';
      } else {
        if (languageCommonItalian.isConsonneImpure(noun) || languageCommonItalian.isIFollowedByVowel(noun)) {
          return 'grande'; // or grande
        } else if (languageCommonItalian.startsWithVowel(noun)) {
          return "grand'"; // or grande
        } else {
          return 'gran';
        }
      }
    }
    case 'santo': {
      if (gender === 'M') {
        if (number === 'P') {
          return 'santi';
        } else {
          if (languageCommonItalian.isConsonneImpure(noun) || languageCommonItalian.isIFollowedByVowel(noun)) {
            return 'santo';
          } else {
            return 'san';
          }
        }
      } else {
        if (number === 'P') {
          return 'sante';
        } else {
          if (languageCommonItalian.startsWithVowel(noun)) {
            return "sant'";
          } else {
            return 'santa';
          }
        }
      }
    }
  }
}

function getAdjFlex(adjInfo: AdjectiveInfo, adjective: string, gender: Genders, number: Numbers): string {
  if (gender + number === 'MS') {
    return adjInfo['MS'] || adjective;
  } else if (adjInfo[gender + number]) {
    return adjInfo[gender + number];
  }

  return null;
}

export function agreeItalianAdjective(
  adjListExceptions: AdjectivesInfo,
  adjList: AdjectivesInfo,
  adjective: string,
  gender: Genders,
  number: Numbers,
  noun: string,
  isBeforeNoun: boolean,
): string {
  if (gender != 'M' && gender != 'F') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `gender must be M F`;
    throw err;
  }
  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `number must be S or P`;
    throw err;
  }
  if (isBeforeNoun && !noun && isIrregular(adjective)) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `when isBeforeNoun is set and adjective is irregular (${adjective}), you must provide the noun`;
    throw err;
  }

  let agreed: string;

  if (
    isBeforeNoun &&
    (adjective === 'povero' || adjective === 'bravo') &&
    gender === 'M' &&
    number === 'S' &&
    noun === 'uomo'
  ) {
    agreed = adjective.slice(0, adjective.length - 1) + "'";
  } else if (isBeforeNoun && isIrregular(adjective)) {
    agreed = getIrregularBeforeNoun(adjective.toLowerCase(), gender, number, noun.toLowerCase());
  } else if (isPossessive(adjective)) {
    agreed = getPossessive(adjective, gender, number);
  } else {
    // we try using exception list
    if (adjListExceptions && adjListExceptions[adjective]) {
      const agreed = getAdjFlex(adjListExceptions[adjective], adjective, gender, number);
      if (agreed) {
        return agreed;
      }
    }
    // otherwise we use the big list
    const adjInfo = getAdjectiveInfo(adjList, adjective.toLowerCase());
    if (gender + number === 'MS') {
      agreed = adjInfo['MS'] || adjective;
    } else if (adjInfo[gender + number]) {
      agreed = adjInfo[gender + number];
    } else {
      const err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${adjective} adjective is in Italian dict but not with ${gender}${number}`;
      throw err;
    }
  }

  const firstChar = adjective.slice(0, 1);
  if (firstChar.toUpperCase() === firstChar) {
    // was sent as LC as in Santos
    return agreed.slice(0, 1).toUpperCase() + agreed.slice(1);
  } else {
    return agreed;
  }
}
