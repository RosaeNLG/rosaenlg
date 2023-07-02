/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Genders, Numbers, agreeAdjective as agreeAdjectiveFct } from 'spanish-adjectives';

type AdjectiveInfoKey = 'MStrue' | 'MPtrue' | 'FStrue' | 'FPtrue' | 'MSfalse' | 'MPfalse' | 'FSfalse' | 'FPfalse';

export interface AdjectiveInfo {
  MStrue: string | null;
  MPtrue: string | null;
  FStrue: string | null;
  FPtrue: string | null;
  MSfalse: string | null;
  MPfalse: string | null;
  FSfalse: string | null;
  FPfalse: string | null;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

function getKey(gender: Genders, number: Numbers, precedesNoun?: boolean): AdjectiveInfoKey {
  return `${gender}${number}${precedesNoun ? 'true' : 'false'}` as AdjectiveInfoKey;
}

export function getAdjectiveInfo(adjective: string): AdjectiveInfo {
  const res: AdjectiveInfo = {
    MStrue: null,
    MPtrue: null,
    FStrue: null,
    FPtrue: null,
    MSfalse: null,
    MPfalse: null,
    FSfalse: null,
    FPfalse: null,
  };
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
  return res;
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
      return (adjectivesInfo[adjective] as AdjectiveInfo)[key] as string;
    }
  }
  return agreeAdjectiveFct(adjective, gender, number, precedesNoun);
}
