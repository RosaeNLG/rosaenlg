import fs = require('fs');

//import * as Debug from 'debug';
//const debug = Debug('german-words');

export type Genders = 'M' | 'F' | 'N';

/*
format:
"DAT":{"SIN":"-"},"GEN":{"SIN":"-"},"AKK":{"SIN":"Hehl"},"G":"N","NOM":{"SIN":"Hehl"}
"G":"M","NOM":{"SIN":"Fonotypist","PLU":"Fonotypisten"},"AKK":{"PLU":"Fonotypisten","SIN":"Fonotypisten"},"DAT":{"PLU":"Fonotypisten","SIN":"Fonotypisten"},"GEN":{"PLU":"Fonotypisten","SIN":"Fonotypisten"}
*/
export interface WordSinPlu {
  SIN: string;
  PLU: string;
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

let wordsInfo: WordsInfo;

export function getWordInfo(word: string, wordsSpecificList: WordsInfo): WordInfo {
  if (wordsSpecificList != null && wordsSpecificList[word] != null) {
    return wordsSpecificList[word];
  } else {
    // lazy loading
    if (wordsInfo != null) {
      // debug('DID NOT RELOAD');
    } else {
      try {
        // debug('LOAD');
        wordsInfo = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/wordsWithGender.json', 'utf8'));
      } catch (err) {
        // istanbul ignore next
        console.log(`could not read German words on disk: ${word}`);
        // istanbul ignore next
      }
    }

    var wordInfo = wordsInfo[word];
    if (wordInfo == null) {
      let err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${word} was not found in German dict`;
      throw err;
    } else {
      return wordInfo;
    }
  }
}

export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type Numbers = 'S' | 'P';

export function getCaseGermanWord(
  word: string,
  germanCase: GermanCases,
  number: Numbers,
  wordsSpecificList: WordsInfo,
): string {
  if (number != 'S' && number != 'P') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  var wordInfo = getWordInfo(word, wordsSpecificList);

  const casesMapping = {
    NOMINATIVE: 'NOM',
    ACCUSATIVE: 'AKK',
    DATIVE: 'DAT',
    GENITIVE: 'GEN',
  };
  if (casesMapping[germanCase] == null) {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `${germanCase} is not a supported German case`;
    throw err;
  }

  return wordInfo[casesMapping[germanCase]][number == 'S' ? 'SIN' : 'PLU'];
}

export function getGenderGermanWord(word: string, wordsSpecificList: WordsInfo): Genders {
  var wordInfo = getWordInfo(word, wordsSpecificList);
  return wordInfo['G'];
}
