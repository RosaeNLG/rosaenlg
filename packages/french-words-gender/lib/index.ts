import fs = require('fs');

//import * as Debug from "debug";
//const debug = Debug("french-words-gender");

export type GendersMF = 'M' | 'F';

// "able":"M"
export interface WordsWithGender {
  [key: string]: GendersMF;
}

let wordsWithGender: WordsWithGender;

export function getGenderFrenchWord(word: string, wordsSpecificList: WordsWithGender): GendersMF {
  if (word == null) {
    let err = new Error();
    err.name = 'TypeError';
    err.message = 'word must not be null';
    throw err;
  }

  if (wordsSpecificList != null && wordsSpecificList[word] != null) {
    return wordsSpecificList[word];
  } else {
    // lazy loading
    if (wordsWithGender != null) {
      // debug('did not reload');
    } else {
      // debug('load');
      try {
        wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/wordsWithGender.json', 'utf8'));
      } catch (err) {
        // istanbul ignore next
        console.log(`could not read French words on disk: ${word}`);
        // istanbul ignore next
      }
    }

    if (wordsWithGender[word] != null) {
      return wordsWithGender[word];
    } else if (wordsWithGender[word.toLowerCase()] != null) {
      return wordsWithGender[word.toLowerCase()];
    } else {
      let err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${word} not found in dict`;
      throw err;
    }
  }
}
