/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import plural from 'pluralize-fr';

export type GendersMF = 'M' | 'F';

export interface GenderList {
  [key: string]: GendersMF;
}

export interface WordsInfo {
  [key: string]: WordInfo;
}
export interface WordInfo {
  gender: GendersMF;
  plural: string;
}

export function getPlural(wordsList: WordsInfo, word: string): string {
  if (!word) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'word must not be null';
    throw err;
  }
  if (wordsList && wordsList[word] && wordsList[word].plural) {
    return wordsList[word].plural;
  } else {
    return plural(word);
  }
}

export function getGender(wordsList: WordsInfo, genderList: GenderList, word: string): GendersMF {
  if (!word) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'word must not be null';
    throw err;
  }

  if (!genderList && !wordsList) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'must provide either wordsList or genderList';
    throw err;
  }

  if (wordsList && wordsList[word] && wordsList[word].gender) {
    return wordsList[word].gender;
  } else if (genderList) {
    if (genderList[word]) {
      return genderList[word];
    } else if (genderList[word.toLowerCase()]) {
      return genderList[word.toLowerCase()];
    }
  }
  const err = new Error();
  err.name = 'NotFoundInDict';
  err.message = `${word} not found in dict for gender`;
  throw err;
}

export function getWordInfo(genderList: GenderList, word: string): WordInfo {
  return {
    gender: getGender(null, genderList, word),
    plural: getPlural(null, word),
  };
}
