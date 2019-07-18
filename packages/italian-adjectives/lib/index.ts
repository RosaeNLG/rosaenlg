import fs = require('fs');
import { isConsonneImpure, isIFollowedByVowel, startsWithVowel } from '@freenlg/freenlg-filter/dist/italian';

export interface AdjectiveInfo {
  MS?: string;
  MP: string;
  FS: string;
  FP: string;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

let adjectivesInfo: AdjectivesInfo;

export function getAdjectiveInfo(adjective: string, adjSpecificList: AdjectivesInfo): AdjectiveInfo {
  const irregularAfter: AdjectivesInfo = {
    bello: { MP: 'belli', FS: 'bella', FP: 'belle' },
    buono: { MP: 'buoni', FS: 'buona', FP: 'buone' },
    grande: { MP: 'grandi', FS: 'grande', FP: 'grandi' },
    santo: { MP: 'santi', FS: 'santa', FP: 'sante' },
  };
  if (adjSpecificList != null && adjSpecificList[adjective] != null) {
    return adjSpecificList[adjective];
  } else if (irregularAfter[adjective] != null) {
    return irregularAfter[adjective];
  } else {
    // lazy loading
    if (adjectivesInfo != null) {
      // debug('did not reload');
    } else {
      // debug('load');
      try {
        adjectivesInfo = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
      } catch (err) {
        // istanbul ignore next
        console.log(`could not read Italian adjective on disk: ${adjective}`);
        // istanbul ignore next
      }
    }
    return adjectivesInfo[adjective];
  }
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
  if (gender == 'M' && number == 'S') {
    return adjective;
  } else {
    return possessives[adjective][gender + number];
  }
}

function getIrregularBeforeNoun(adjective: string, gender: Genders, number: Numbers, noun: string): string {
  // http://www.arnix.it/free-italian/italian-grammar/adjectives-irregular-in-italian.php
  switch (adjective.toLowerCase()) {
    case 'bello': {
      if (gender == 'M') {
        if (startsWithVowel(noun)) {
          if (number == 'S') {
            return "bell'";
          } else {
            return 'begli';
          }
        } else if (isConsonneImpure(noun) || isIFollowedByVowel(noun)) {
          if (number == 'S') {
            return 'bello';
          } else {
            return 'begli';
          }
        } else {
          if (number == 'S') {
            return 'bel';
          } else {
            return 'bei';
          }
        }
      } else {
        if (startsWithVowel(noun)) {
          if (number == 'S') {
            return "bell'";
          } else {
            return 'belle';
          }
        } else {
          if (number == 'S') {
            return 'bella';
          } else {
            return 'belle';
          }
        }
      }
    }
    case 'buono': {
      if (gender == 'M') {
        if (isConsonneImpure(noun) || isIFollowedByVowel(noun)) {
          if (number == 'S') {
            return 'buono';
          } else {
            return 'buoni';
          }
        } else {
          if (number == 'S') {
            return 'buon';
          } else {
            return 'buoni';
          }
        }
      } else {
        if (startsWithVowel(noun)) {
          if (number == 'S') {
            return "buon'";
          } else {
            return 'buone';
          }
        } else {
          if (number == 'S') {
            return 'buona';
          } else {
            return 'buone';
          }
        }
      }
    }
    case 'grande': {
      if (number == 'P') {
        return 'grandi';
      } else {
        if (isConsonneImpure(noun) || isIFollowedByVowel(noun)) {
          return 'grande'; // or grande
        } else if (startsWithVowel(noun)) {
          return "grand'"; // or grande
        } else {
          return 'gran';
        }
      }
    }
    case 'santo': {
      if (gender == 'M') {
        if (number == 'P') {
          return 'santi';
        } else {
          if (isConsonneImpure(noun) || isIFollowedByVowel(noun)) {
            return 'santo';
          } else {
            return 'san';
          }
        }
      } else {
        if (number == 'P') {
          return 'sante';
        } else {
          if (startsWithVowel(noun)) {
            return "sant'";
          } else {
            return 'santa';
          }
        }
      }
    }
  }
}

export function agreeItalianAdjective(
  adjective: string,
  gender: Genders,
  number: Numbers,
  noun: string,
  isBeforeNoun: boolean,
  adjSpecificList: AdjectivesInfo,
): string {
  if (gender != 'M' && gender != 'F') {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `gender must be M F`;
    throw err;
  }
  if (number != 'S' && number != 'P') {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `number must be S or P`;
    throw err;
  }
  if (isBeforeNoun && noun == null && isIrregular(adjective)) {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `when isBeforeNoun is set and adjective is irregular (${adjective}), you must provide the noun`;
    throw err;
  }

  let agreed: string;

  if (
    isBeforeNoun &&
    (adjective == 'povero' || adjective == 'bravo') &&
    gender == 'M' &&
    number == 'S' &&
    noun == 'uomo'
  ) {
    agreed = adjective.slice(0, adjective.length - 1) + "'";
  } else if (isBeforeNoun && isIrregular(adjective)) {
    agreed = getIrregularBeforeNoun(adjective.toLowerCase(), gender, number, noun.toLowerCase());
  } else if (isPossessive(adjective)) {
    agreed = getPossessive(adjective, gender, number);
  } else {
    let adjInfo = getAdjectiveInfo(adjective.toLowerCase(), adjSpecificList);
    if (adjInfo == null) {
      let err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${adjective} adjective is not in Italian dict`;
      throw err;
    }
    if (gender + number == 'MS') {
      agreed = adjInfo['MS'] || adjective;
    } else if (adjInfo[gender + number] != null) {
      agreed = adjInfo[gender + number];
    } else {
      let err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${adjective} adjective is in Italian dict but not with ${gender}${number}`;
      throw err;
    }
  }

  let firstChar = adjective.slice(0, 1);
  if (firstChar.toUpperCase() == firstChar) {
    // was sent as LC as in Santos
    return agreed.slice(0, 1).toUpperCase() + agreed.slice(1);
  } else {
    return agreed;
  }
}
