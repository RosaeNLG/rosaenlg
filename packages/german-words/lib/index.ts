/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


export type Genders = 'M' | 'F' | 'N';

/*
format:
"DAT":{"SIN":"-"},"GEN":{"SIN":"-"},"AKK":{"SIN":"Hehl"},"G":"N","NOM":{"SIN":"Hehl"}
"G":"M","NOM":{"SIN":"Fonotypist","PLU":"Fonotypisten"},"AKK":{"PLU":"Fonotypisten","SIN":"Fonotypisten"},"DAT":{"PLU":"Fonotypisten","SIN":"Fonotypisten"},"GEN":{"PLU":"Fonotypisten","SIN":"Fonotypisten"}
*/
export interface WordSinPlu {
  SIN?: string;
  PLU?: string;
}
export interface WordInfo {
  DAT: WordSinPlu;
  GEN: WordSinPlu;
  AKK: WordSinPlu;
  NOM: WordSinPlu;
  G: Genders;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}

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

type CaseKey = 'DAT' | 'GEN' | 'AKK' | 'NOM' | 'G'; // 'G' to compile

function getCaseNumber(wordsList: WordsInfo, caseKey: CaseKey, numberKey: 'SIN' | 'PLU', word: string): Genders {
  if (wordsList && wordsList[word] && wordsList[word][caseKey] && wordsList[word][caseKey][numberKey]) {
    return wordsList[word][caseKey][numberKey];
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

  const caseKey = casesMapping[germanCase] as CaseKey;
  const numberKey = number == 'S' ? 'SIN' : 'PLU';
  const caseNumber =
    getCaseNumber(wordsListExceptions, caseKey, numberKey, word) || getCaseNumber(wordsList, caseKey, numberKey, word);

  if (caseNumber) {
    return caseNumber;
  } else {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${word} was not found in German dict for case and number`;
    throw err;
  }
}

function getGender(wordsList: WordsInfo, word: string): Genders {
  if (wordsList && wordsList[word] && wordsList[word]['G']) {
    return wordsList[word]['G'];
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
