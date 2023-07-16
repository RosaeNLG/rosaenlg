/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import plural from 'rosaenlg-pluralize-fr';

import { GenderList, GendersMF } from 'french-words-gender-lefff';

export interface WordsInfo {
  [key: string]: WordInfo;
}
export interface WordInfo {
  gender: GendersMF;
  plural: string;
}

export function getPlural(wordsList: WordsInfo | null, word: string): string {
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

export function getGender(wordsList: WordsInfo | null, genderList: GenderList, word: string): GendersMF {
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
  if (word === 'M' || word === 'F' || word === 'N') {
    err.message = `${word} is a gender. You must use an object that has a gender.`;
  } else {
    err.message = `${word} not found in dict for gender`;
  }
  throw err;
}

export function getWordInfo(genderList: GenderList, word: string): WordInfo {
  return {
    gender: getGender(null, genderList, word),
    plural: getPlural(null, word),
  };
}
