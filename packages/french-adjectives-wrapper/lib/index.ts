import { contracts } from 'french-contractions';
import { agree as agreeFct, getChangeant, GendersMF, Numbers } from 'french-adjectives';

export interface AdjectiveInfo {
  MS: string;
  MP: string;
  FS: string;
  FP: string;
  [key: string]: string;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

export function getAdjectiveInfo(adjective: string): AdjectiveInfo {
  const res = {};
  for (const gender of ['M', 'F']) {
    for (const number of ['S', 'P']) {
      const agreedAdj = agreeFct(adjective, gender as GendersMF, number as Numbers, null, false);
      res[gender + number] = agreedAdj;
      if (getChangeant(agreedAdj)) {
        res[agreedAdj] = getChangeant(agreedAdj);
      }
    }
  }
  return res as AdjectiveInfo;
}

export function agreeAdjective(
  adjectivesInfo: AdjectivesInfo,
  adjective: string,
  gender: GendersMF,
  number: Numbers,
  noun: string,
  isBeforeNoun: boolean,
): string {
  if (gender != 'M' && gender != 'F') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `gender must be M or F`;
    throw err;
  }
  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `number must be S or P`;
    throw err;
  }
  if (isBeforeNoun && !noun) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `when isBeforeNoun is set, you must provide the noun`;
    throw err;
  }

  if (adjectivesInfo) {
    const key = gender + number;
    if (!adjectivesInfo[adjective] || !adjectivesInfo[adjective][key]) {
      const err = new Error();
      err.name = 'DictError';
      err.message = `key ${key} not found in embedded dict for French adjective ${adjective}`;
      throw err;
    }
    const agreedAdj = adjectivesInfo[adjective][key];

    if (isBeforeNoun && number === 'S' && adjectivesInfo[adjective][agreedAdj] != null) {
      if (contracts(noun)) {
        return adjectivesInfo[adjective][agreedAdj];
      }
    }
    return agreedAdj;
  } else {
    return agreeFct(adjective, gender, number, noun, isBeforeNoun);
  }
}
