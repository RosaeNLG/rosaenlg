import fs = require('fs');
import { NOMEM } from 'dns';

let wordsWithGender: any;

function load(): void {
  // lazy loading
  if (wordsWithGender!=null) {
    //console.log('DID NOT RELOAD');
  } else {
    //console.log('LOAD');
    wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/de_DE/wordsWithGender.json', 'utf8'));
  }
}

function getWord(word: string, reason: string): string {
  var wordInfo = wordsWithGender[word];
  if (wordInfo==null) {
    console.log(`WARNING ${word} is not in German dict (looking: ${reason})`);
    return null;
  } else {
    return wordInfo;
  }
}

export function getCaseGermanWord(word: string, germanCase: string): string {
  load();

  var wordInfo = getWord(word, 'case');
  if (wordInfo==null) {
    return word;
  }

  const casesMapping = {
    'NOMINATIVE':'NOM',
    'ACCUSATIVE':'AKK',
    'DATIVE':'DAT',
    'GENITIVE':'GEN'
  }
  if (casesMapping[germanCase]==null) {
    console.log(`ERROR ${germanCase} is not a supported German case`);
    return word;
  }

  return wordInfo[ casesMapping[germanCase] ]['SIN'];
}

export function getGenderGermanWord(word: string): string {
  load();

  var wordInfo = getWord(word, 'gender');
  if (wordInfo==null) {
    return null;
  }

  return wordInfo['G'];
}

