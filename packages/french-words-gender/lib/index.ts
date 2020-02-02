//import * as Debug from "debug";
//const debug = Debug("french-words-gender");

export type GendersMF = 'M' | 'F';

// "able":"M"
export interface WordsWithGender {
  [key: string]: GendersMF;
}

export function getGenderFrenchWord(wordsList: WordsWithGender, word: string): GendersMF {
  if (!word) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'word must not be null';
    throw err;
  }
  if (!wordsList) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'words list must not be null';
    throw err;
  }

  if (wordsList[word]) {
    return wordsList[word];
  } else {
    if (wordsList[word.toLowerCase()]) {
      return wordsList[word.toLowerCase()];
    } else {
      const err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${word} not found in dict`;
      throw err;
    }
  }
}
