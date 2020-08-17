import { Genders, Numbers, agreeAdjective as agreeAdjectiveFct } from 'spanish-adjectives';

export interface AdjectiveInfo {
  MStrue: string;
  MPtrue: string;
  FStrue: string;
  FPtrue: string;
  MSfalse: string;
  MPfalse: string;
  FSfalse: string;
  FPfalse: string;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

function getKey(gender: Genders, number: Numbers, precedesNoun?: boolean): string {
  return `${gender}${number}${precedesNoun ? 'true' : 'false'}`;
}

export function getAdjectiveInfo(adjective: string): AdjectiveInfo {
  const res = {};
  for (const gender of ['M', 'F']) {
    for (const number of ['S', 'P']) {
      for (const precedes of [true, false]) {
        res[getKey(gender as Genders, number as Numbers, precedes)] = agreeAdjectiveFct(
          adjective,
          gender as Genders,
          number as Numbers,
          precedes,
        );
      }
    }
  }
  return res as AdjectiveInfo;
}

export function agreeAdjective(
  adjectivesInfo: AdjectivesInfo,
  adjective: string,
  gender: Genders,
  number: Numbers,
  precedesNoun?: boolean,
): string {
  if (adjectivesInfo) {
    const key = getKey(gender, number, precedesNoun);
    if (adjectivesInfo[adjective] && adjectivesInfo[adjective][key]) {
      return adjectivesInfo[adjective][key];
    }
  }
  return agreeAdjectiveFct(adjective, gender, number, precedesNoun);
}
