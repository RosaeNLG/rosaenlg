/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Person0To5, validTenses, getConjugation as getConjugationFct } from 'spanish-verbs';

// verb > tense > person > string
export interface VerbInfoTense {
  [key: number /* person */]: string;
}
export interface VerbInfo {
  [key: string /* tense */]: VerbInfoTense;
}
export interface VerbsInfo {
  [key: string]: VerbInfo;
}

export function getVerbInfo(verb: string): VerbInfo {
  const verbInfo: VerbInfo = {};
  for (const tense of validTenses) {
    verbInfo[tense] = {};
    const persons = [2, 5];
    for (const person of persons) {
      verbInfo[tense][person] = getConjugationFct(verb, tense, person as Person0To5);
    }
  }
  return verbInfo;
}

export function getConjugation(verbsList: VerbsInfo, verb: string, tense: string, number: 'S' | 'P'): string {
  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }

  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'number must be S or P';
    throw err;
  }

  const person = number == 'S' ? 2 : 5;

  // must test validTenses list as is not included in browser packed packages
  if (!tense || (validTenses && validTenses.indexOf(tense)) === -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `tense must be ${validTenses.join()}`;
    throw err;
  }

  if (verbsList) {
    const verbInfo = verbsList[verb];
    if (!verbInfo) {
      const err = new Error();
      err.name = 'DictError';
      err.message = `verb ${verb} not found in list!`;
      throw err;
    }
    const verbInfoTense = verbInfo[tense];
    if (!verbInfoTense) {
      const err = new Error();
      err.name = 'DictError';
      err.message = `tense ${tense} not found for ${verb}: ${verbInfo}!`;
      throw err;
    }
    const conjugated = verbInfoTense[person];
    if (!conjugated) {
      const err = new Error();
      err.name = 'DictError';
      err.message = `person ${person} not found for ${verb}: ${conjugated}!`;
      throw err;
    }
    return conjugated;
  } else {
    return getConjugationFct(verb, tense, person);
  }
}
