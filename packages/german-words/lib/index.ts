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

export function getCaseGermanWord(
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

  const wordInfo = getWordInfo(wordsList, word);

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

  return wordInfo[casesMapping[germanCase]][number == 'S' ? 'SIN' : 'PLU'];
}

export function getGenderGermanWord(wordsList: WordsInfo, word: string): Genders {
  const wordInfo = getWordInfo(wordsList, word);
  return wordInfo['G'];
}
