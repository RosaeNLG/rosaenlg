/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import genderFct from 'rosaenlg-gender-es';
import pluralFct from 'rosaenlg-pluralize-es';

export type Genders = 'M' | 'F' | 'N';

export interface WordInfo {
  gender: Genders;
  plural: string;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}

export function getPluralSpanishWord(wordsInfo: WordsInfo | null, word: string): string {
  if (wordsInfo && wordsInfo[word] && wordsInfo[word].plural) {
    return wordsInfo[word].plural;
  } else {
    return pluralFct(word);
  }
}

export function getGenderSpanishWord(wordsInfo: WordsInfo | null, word: string): Genders {
  if (wordsInfo && wordsInfo[word] && wordsInfo[word].gender) {
    return wordsInfo[word].gender;
  } else {
    const gender: 'm' | 'f' | 'n' = genderFct(word); // it always returns something, never null
    return gender.toUpperCase() as Genders;
  }
}

export function getWordInfo(word: string): WordInfo {
  return {
    gender: getGenderSpanishWord(null, word),
    plural: getPluralSpanishWord(null, word),
  };
}
