/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { contracts, ContractsData } from 'french-contractions';
import { agree as agreeFct, getChangeant, GendersMF, Numbers } from 'french-adjectives';

export interface AdjectiveInfo {
  MS: string;
  MP: string;
  FS: string;
  FP: string;
  [key: string]: string; // when is before noun; key is agreed adj
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

export function getAdjectiveInfo(adjective: string, contractsData: ContractsData): AdjectiveInfo {
  const res = {};
  for (const gender of ['M', 'F']) {
    for (const number of ['S', 'P']) {
      const agreedAdj = agreeFct(adjective, gender as GendersMF, number as Numbers, null, false, contractsData);
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
  contractsData: ContractsData, // about the noun, not the adjective
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
    if (adjectivesInfo[adjective] && adjectivesInfo[adjective][key]) {
      const agreedAdj = adjectivesInfo[adjective][key];
      if (isBeforeNoun && number === 'S' && adjectivesInfo[adjective][agreedAdj] != null) {
        if (contracts(noun, contractsData)) {
          return adjectivesInfo[adjective][agreedAdj];
        }
      }
      return agreedAdj;
    }
  }
  // when nothing found in adjectivesInfo
  return agreeFct(adjective, gender, number, noun, isBeforeNoun, contractsData);
}
