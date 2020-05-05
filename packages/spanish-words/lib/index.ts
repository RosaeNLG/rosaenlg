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

export function getPluralSpanishWord(wordsInfo: WordsInfo, word: string): string {
  if (wordsInfo) {
    if (!wordsInfo[word] || !wordsInfo[word].plural) {
      const err = new Error();
      err.name = 'DictError';
      err.message = `${word} should be in embedded dict for plural, but is not here`;
      throw err;
    }
    return wordsInfo[word].plural;
  } else {
    return pluralFct(word);
  }
}

export function getGenderSpanishWord(wordsInfo: WordsInfo, word: string): Genders {
  if (wordsInfo) {
    if (!wordsInfo[word] || !wordsInfo[word].gender) {
      const err = new Error();
      err.name = 'DictError';
      err.message = `${word} should be in embedded dict for gender, but is not here`;
      throw err;
    }
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
