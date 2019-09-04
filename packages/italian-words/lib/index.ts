import fs = require('fs');

export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';

export interface WordInfo {
  G: Genders;
  S: string;
  P: string;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}

let wordsInfo: WordsInfo;

export function getWordInfo(word: string, wordsSpecificList: WordsInfo): WordInfo {
  if (wordsSpecificList && wordsSpecificList[word]) {
    return wordsSpecificList[word];
  } else {
    // lazy loading
    if (wordsInfo) {
      // debug('DID NOT RELOAD');
    } else {
      try {
        // debug('LOAD');
        wordsInfo = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/words.json', 'utf8'));
      } catch (err) {
        // istanbul ignore next
        console.log(`could not read Italian words on disk: ${word}`);
        // istanbul ignore next
      }
    }

    let wordInfo = wordsInfo[word];
    if (!wordInfo) {
      let err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${word} was not found in Italian dict`;
      throw err;
    } else {
      return wordInfo;
    }
  }
}

export function getNumberItalianWord(word: string, number: Numbers, wordsSpecificList: WordsInfo): string {
  if (number != 'S' && number != 'P') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  let wordInfo = getWordInfo(word, wordsSpecificList);

  if (wordInfo[number]) {
    return wordInfo[number];
  } else {
    let err = new Error();
    err.name = 'NotInDictError';
    err.message = `${number} form not found for ${word}!`;
    throw err;
  }
}

export function getGenderItalianWord(word: string, wordsSpecificList: WordsInfo): Genders {
  let wordInfo = getWordInfo(word, wordsSpecificList);
  return wordInfo['G'];
}
