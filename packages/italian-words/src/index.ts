/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type Numbers = 'S' | 'P';

import { WordsInfo, WordInfo, Genders } from 'italian-words-dict';

export function getWordInfo(wordsList: WordsInfo, word: string): WordInfo {
  if (!wordsList) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `words list must not be null`;
    throw err;
  }

  if (wordsList[word]) {
    return wordsList[word];
  } else {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${word} was not found in Italian dict`;
    throw err;
  }
}

function getNumberHelper(wordsList: WordsInfo, word: string, number: Numbers): string {
  if (wordsList && wordsList[word]) {
    const wordInfo = wordsList[word];
    if (number == 'S') {
      return wordInfo['S'] || word; // default value is the key
    } else if (wordInfo['P']) {
      return wordInfo['P'];
    }
  }
  return null;
}

export function getNumberItalianWord(
  wordsListException: WordsInfo,
  wordsList: WordsInfo,
  word: string,
  number: Numbers,
): string {
  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  const res = getNumberHelper(wordsListException, word, number) || getNumberHelper(wordsList, word, number);
  if (res) {
    return res;
  }

  const err = new Error();
  err.name = 'NotInDictError';
  err.message = `${number} form not found for ${word}!`;
  throw err;
}

function getGenderHelper(wordsList: WordsInfo, word: string): Genders {
  if (wordsList && wordsList[word] && wordsList[word]['G']) {
    return wordsList[word]['G'];
  }
  return null;
}

export function getGenderItalianWord(wordsListException: WordsInfo, wordsList: WordsInfo, word: string): Genders {
  const gender = getGenderHelper(wordsListException, word) || getGenderHelper(wordsList, word);
  if (gender) {
    return gender;
  } else {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${word} was not found in Italian dict for gender`;
    throw err;
  }
}
