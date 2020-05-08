export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';

export interface WordInfo {
  G: Genders;
  S?: string; // not present in dict when same as key
  P: string;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}

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

export function getNumberItalianWord(wordsList: WordsInfo, word: string, number: Numbers): string {
  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  const wordInfo = getWordInfo(wordsList, word);

  if (number == 'S') {
    return wordInfo['S'] || word; // default value is the key
  } else {
    // P
    if (wordInfo['P']) {
      return wordInfo['P'];
    } else {
      const err = new Error();
      err.name = 'NotInDictError';
      err.message = `plural form not found for ${word}!`;
      throw err;
    }
  }
}

export function getGenderItalianWord(wordsList: WordsInfo, word: string): Genders {
  const wordInfo = getWordInfo(wordsList, word);
  return wordInfo['G'];
}
