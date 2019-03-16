import fs = require('fs');

import * as Debug from "debug";
const debug = Debug("german-words");

let wordsWithGender: any;

function load(): void {
  // lazy loading
  if (wordsWithGender!=null) {
    // debug('DID NOT RELOAD');
  } else {
    // debug('LOAD');
    wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/wordsWithGender.json', 'utf8'));
  }
}

function getWord(word: string): string {
  load();

  var wordInfo = wordsWithGender[word];
  if (wordInfo==null) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${word} was not found in German dict`;
    throw err;
  } else {
    return wordInfo;
  }
}

export function getCaseGermanWord(
    word: string, 
    germanCase: 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE',
    number: 'S'|'P'): string {

  if (number!='S' && number!='P') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  var wordInfo = getWord(word);

  const casesMapping = {
    'NOMINATIVE':'NOM',
    'ACCUSATIVE':'AKK',
    'DATIVE':'DAT',
    'GENITIVE':'GEN'
  }
  if (casesMapping[germanCase]==null) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = `${germanCase} is not a supported German case`;
    throw err;
  }

  return wordInfo[ casesMapping[germanCase] ][number=='S' ? 'SIN' : 'PLU'];
}

export function getGenderGermanWord(word: string): 'M'|'F'|'N' {
  var wordInfo = getWord(word);
  return wordInfo['G'];
}

