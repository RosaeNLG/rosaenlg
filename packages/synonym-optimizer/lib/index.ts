
import * as tokenizer from "wink-tokenizer";
import stopwords_fr = require("stopwords-fr");
import stopwords_de = require("stopwords-de");
import stopwords_en = require("stopwords-en");

import * as englishStemmer from "snowball-stemmer.jsx/dest/english-stemmer.common.js";
import * as frenchStemmer from "snowball-stemmer.jsx/dest/french-stemmer.common.js";
import * as germanStemmer from "snowball-stemmer.jsx/dest/german-stemmer.common.js";

import * as Debug from "debug";
const debug = Debug("synonym-optimizer");

// exported for testing purposes
export function getStandardStopWords(lang:'fr_FR'|'de_DE'|'en_US'):string[] {

  switch(lang) {
    case 'en_US': return stopwords_en;
    case 'fr_FR': return stopwords_fr;
    case 'de_DE': return stopwords_de;
  }
}

export function getStopWords(
    lang:'fr_FR'|'de_DE'|'en_US', 
    stopWordsToAdd: string[],
    stopWordsToRemove: string[],
    stopWordsOverride: string[]
  ): string[] {

  let baseList:string[];

  // the base list
  if (stopWordsOverride!=null) {
    baseList = stopWordsOverride.slice(0);
  } else {
    baseList = getStandardStopWords(lang);
  }

  // remove
  if (stopWordsToRemove!=null) {
    baseList = baseList.filter( (word) => !stopWordsToRemove.includes(word) );
  }

  // and add
  if (stopWordsToAdd!=null) {
    baseList = baseList.concat(stopWordsToAdd);
  }

  return baseList.map(alt => alt.toLowerCase());

}

export function extractWords(input: string): string[] {
  let myTokenizer = new tokenizer();

  myTokenizer.defineConfig({ 
    currency: false,
    number: false,
    punctuation: false,
    symbol: false,
    time: false    
  });

  const tokenized:any[] = myTokenizer.tokenize(input);

  let res:string[] = [];
  tokenized.forEach(function(elt) {
    if (elt.tag!='alien') {
      res.push(elt.value);
    }
  });

  return res;
}

export function getWordsWithPos(
  lang:'en_US'|'de_DE'|'fr_FR', 
  words: string[], 
  identicals: string[][], 
  debugHolder: any): any {

  let identicalsMap:any = {};
  if (identicals!=null) {

    // check type
    if ( !Array.isArray(identicals) ) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `identicals must be a string[][]`;
      throw err;
    } else {
      identicals.forEach(function(identicalList) {
        if ( !Array.isArray(identicalList) ) {
          var err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `identicals must be a string[][]`;
          throw err;    
        }
      })
    }

    if (debugHolder) {
      debugHolder.identicals = identicals;
    }
  
    // do the job
    identicals.forEach(function(identicalList) {
      const mapTo:string = identicalList.join('_');
      identicalList.forEach(function(identicalElt) {
        //console.log(`${identicalElt} => ${stemmer.stemWord(identicalElt)}`);
        identicalsMap[getStemmer(lang).stemWord(identicalElt)] = mapTo;
      });
    });
  }
  if (debugHolder) {
    debugHolder.identicalsMap = identicalsMap;
  }
  //console.log(identicalsMap);

  let wordsWithPos = {};
  for(var j=0; j<words.length; j++) {
    const word:string = identicalsMap[words[j]] || words[j];

    if (wordsWithPos[word]==null) {
      wordsWithPos[word] = [];
    }
    wordsWithPos[word].push(j)
  }

  return wordsWithPos;

}

export function getScore(wordsWithPos:any): number {
  let score = 0;

  Object.keys(wordsWithPos).forEach(word => {
    const positions:number[] = wordsWithPos[word];
    for (var j=1; j<positions.length; j++) {
      score += 1 / ( positions[j] - positions[j-1] );
    }
  });

  return score;
}




// useful ones

export function getBest(
  lang:'en_US'|'de_DE'|'fr_FR', 
  alternatives: string[],
  stopWordsToAdd: string[],
  stopWordsToRemove: string[],
  stopWordsOverride: string[],
  identicals: string[][]
  ): number {
  
  var scores:number[] = [];
  
  alternatives.forEach(function(alt) {
    scores.push( scoreAlternative(lang, alt, 
      stopWordsToAdd, stopWordsToRemove, stopWordsOverride,
      identicals, null) );
  });
  
  
  return scores.indexOf( Math.min(...scores) );
}

function getStemmer(lang:'en_US'|'de_DE'|'fr_FR'):any {
  switch(lang) {
    case 'en_US':
      return new englishStemmer.EnglishStemmer();
    case 'de_DE':
      return new germanStemmer.GermanStemmer();
    case 'fr_FR':
      return new frenchStemmer.FrenchStemmer();
  }
}

export function scoreAlternative(
    lang:'en_US'|'de_DE'|'fr_FR', 
    alternative: string,
    stopWordsToAdd: string[],
    stopWordsToRemove: string[],
    stopWordsOverride: string[],
    identicals: string[][],
    debugHolder: any
  ): number {
  
  
  if (['en_US','de_DE','fr_FR'].indexOf(lang)==-1) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${lang} is not a supported language`;
    throw err;
  }
  

  
  // console.log(stemmer.stemWord("baby"));


  // console.log(stopWordsToAdd);
  const stopwords:string[] = getStopWords(lang, stopWordsToAdd, stopWordsToRemove, stopWordsOverride);
  // console.log(stopwords);

  const filteredAlt:string[] = getStemmer(lang).stemWords( 
                                extractWords(alternative)
                                  .map(alt => alt.toLowerCase())
                                  .filter( (alt) => !stopwords.includes(alt) ) );
  //console.log(filteredAlt);

  if (debugHolder) {
    debugHolder.filteredAlt = filteredAlt;
  }

  var wordsWithPos:any = getWordsWithPos( lang, filteredAlt, identicals, debugHolder );
  
  if (debugHolder) {
    // only keep ones with > 1 for readability
    debugHolder.wordsWithPos = {};
    Object.keys(wordsWithPos).forEach(word => {
      if (wordsWithPos[word].length>1) {
        debugHolder.wordsWithPos[word] = wordsWithPos[word];
      }
    });  
  }                              

  // console.log(wordsWithPos);

  // score
  let score:number = getScore(wordsWithPos);
  if (debugHolder) {
    debugHolder.score = score;
  }
  return score;


  // console.log(score);

}

