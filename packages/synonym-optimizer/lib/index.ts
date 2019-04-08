
import * as tokenizer from "wink-tokenizer";
import stopwords_iso = require("stopwords-iso");

import * as Debug from "debug";
const debug = Debug("synonym-optimizer");

// exported for testing purposes
export function getStandardStopWords(lang):string[] {

  const langMapping:any = {
    'fr_FR':'fr',
    'de_DE':'de',
    'en_US':'en'
  }
  const langMapped:string = langMapping[lang];
  if (langMapped==null || stopwords_iso[langMapped]==null) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${lang} is not a supported language`;
    throw err;
  }

  return stopwords_iso[langMapped];
}

export function getStopWords(
    lang:string, 
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

export function getWordsWithPos(words: string[], identicals: string[][]): any {

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
  
    // do the job
    identicals.forEach(function(identicalList) {
      const mapTo:string = identicalList.join('_');
      identicalList.forEach(function(identicalElt) {
        identicalsMap[identicalElt] = mapTo;
      });
    });
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
  lang:string, 
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

export function scoreAlternative(
    lang:string, 
    alternative: string,
    stopWordsToAdd: string[],
    stopWordsToRemove: string[],
    stopWordsOverride: string[],
    identicals: string[][],
    debugHolder: any
  ): number {

  // console.log(stopWordsToAdd);
  const stopwords:string[] = getStopWords(lang, stopWordsToAdd, stopWordsToRemove, stopWordsOverride);
  // console.log(stopwords);
  
  const filteredAlt:string[] = extractWords(alternative)
                                .map(alt => alt.toLowerCase())
                                .filter( (alt) => !stopwords.includes(alt) )

  if (debugHolder) {
    debugHolder.filteredAlt = filteredAlt;
  }                              
                                
  var wordsWithPos:any = getWordsWithPos( filteredAlt, identicals );
  
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

