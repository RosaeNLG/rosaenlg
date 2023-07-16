/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  WordsInfo,
  WordInfo,
  Genders,
  WordNumber,
  WordInfoKey,
  WordSinPlu,
  WordInfoKeyCaseOnly,
} from 'german-words-dict';

export function getWordInfo(wordsList: WordsInfo, word: string): WordInfo {
  if (!wordsList) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `words list cannot be null`;
    throw err;
  }

  if (wordsList[word]) {
    return wordsList[word];
  } else {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${word} was not found in German dict`;
    throw err;
  }
}

export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type Numbers = 'S' | 'P';

function getCaseNumber(
  wordsList: WordsInfo,
  wordInfoKey: WordInfoKey,
  numberKey: WordNumber,
  word: string,
): string | null {
  if (
    wordsList &&
    wordsList[word] &&
    wordsList[word][wordInfoKey] &&
    (wordsList[word][wordInfoKey as WordInfoKeyCaseOnly] as WordSinPlu)[numberKey]
  ) {
    return (wordsList[word][wordInfoKey as WordInfoKeyCaseOnly] as WordSinPlu)[numberKey] as string;
  } else {
    return null;
  }
}

export function getCaseGermanWord(
  wordsListExceptions: WordsInfo,
  wordsList: WordsInfo,
  word: string,
  germanCase: GermanCases,
  number: Numbers,
): string {
  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  const casesMapping = {
    NOMINATIVE: 'NOM',
    ACCUSATIVE: 'AKK',
    DATIVE: 'DAT',
    GENITIVE: 'GEN',
  };
  if (!casesMapping[germanCase]) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `${germanCase} is not a supported German case`;
    throw err;
  }

  const wordInfoKey = casesMapping[germanCase] as WordInfoKey;
  const numberKey = number == 'S' ? 'SIN' : 'PLU';
  const caseNumber =
    getCaseNumber(wordsListExceptions, wordInfoKey, numberKey, word) ||
    getCaseNumber(wordsList, wordInfoKey, numberKey, word);

  if (caseNumber) {
    return caseNumber;
  } else {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${word} was not found in German dict for case and number`;
    throw err;
  }
}

function getGender(wordsList: WordsInfo, word: string): Genders | null {
  if (wordsList && wordsList[word] && wordsList[word]['G']) {
    return wordsList[word]['G'] as Genders;
  } else {
    return null;
  }
}

export function getGenderGermanWord(wordsListExceptions: WordsInfo, wordsList: WordsInfo, word: string): Genders {
  const gender = getGender(wordsListExceptions, word) || getGender(wordsList, word);
  if (gender) {
    return gender;
  } else {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${word} was not found in German dict for gender`;
    throw err;
  }
}
