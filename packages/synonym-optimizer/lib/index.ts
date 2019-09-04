import * as tokenizer from 'wink-tokenizer';

import stopwordsFr = require('stopwords-fr');
import stopwordsDe = require('stopwords-de');
import stopwordsEn = require('stopwords-en');
import stopwordsIt = require('stopwords-it');

import * as englishStemmer from 'snowball-stemmer.jsx/dest/english-stemmer.common.js';
import * as frenchStemmer from 'snowball-stemmer.jsx/dest/french-stemmer.common.js';
import * as germanStemmer from 'snowball-stemmer.jsx/dest/german-stemmer.common.js';
import * as italianStemmer from 'snowball-stemmer.jsx/dest/italian-stemmer.common.js';

//import * as Debug from 'debug';
//const debug = Debug('synonym-optimizer');

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | string;
const fullySupportedLanguages = ['en_US', 'de_DE', 'fr_FR', 'it_IT'];

// exported for testing purposes
export function getStandardStopWords(lang: Languages): string[] {
  switch (lang) {
    case 'en_US':
      return stopwordsEn;
    case 'fr_FR':
      return stopwordsFr;
    case 'de_DE':
      return stopwordsDe;
    case 'it_IT':
      return stopwordsIt;
    default:
      return [];
  }
}

export function getStopWords(
  lang: Languages,
  stopWordsToAdd: string[],
  stopWordsToRemove: string[],
  stopWordsOverride: string[],
): string[] {
  let baseList: string[];

  // the base list
  if (stopWordsOverride) {
    baseList = stopWordsOverride.slice(0);
  } else {
    baseList = getStandardStopWords(lang);
  }

  // remove
  if (stopWordsToRemove) {
    baseList = baseList.filter(function(word: string): boolean {
      return !stopWordsToRemove.includes(word);
    });
  }

  // and add
  if (stopWordsToAdd) {
    baseList = baseList.concat(stopWordsToAdd);
  }

  return baseList.map(function(alt: string): string {
    return alt.toLowerCase();
  });
}

export function extractWords(input: string): string[] {
  let myTokenizer = new tokenizer();

  myTokenizer.defineConfig({
    currency: false,
    number: false,
    punctuation: false,
    symbol: false,
    time: false,
  });

  const tokenized: tokenizer.Token[] = myTokenizer.tokenize(input);
  //console.log(tokenized);

  let res: string[] = [];
  tokenized.forEach(function(elt): void {
    if (elt.tag != 'alien') {
      res.push(elt.value);
    }
  });

  return res;
}

interface Stemmer {
  stemWord: (string) => string;
}

interface StemmersCache {
  [key: string]: Stemmer;
}
let stemmersCache: StemmersCache = {};

interface WordsWithPos {
  [key: string]: number[];
}

function stemWordForLang(word: string, lang: Languages): string {
  if (fullySupportedLanguages.includes(lang)) {
    //console.log(`ok ${lang} is valid`);
    if (!stemmersCache[lang]) {
      switch (lang) {
        case 'en_US':
          stemmersCache[lang] = new englishStemmer.EnglishStemmer();
          break;
        case 'de_DE':
          stemmersCache[lang] = new germanStemmer.GermanStemmer();
          break;
        case 'fr_FR':
          stemmersCache[lang] = new frenchStemmer.FrenchStemmer();
          break;
        case 'it_IT':
          stemmersCache[lang] = new italianStemmer.ItalianStemmer();
          break;
      }
    }
    //console.log(`orig: ${word}, stemmed: ${stemmersCache[lang].stemWord(word)}`);
    return stemmersCache[lang].stemWord(word);
  }
  return word;
}

export function getWordsWithPos(
  lang: Languages,
  words: string[],
  identicals: string[][],
  debugHolder: DebugHolder,
): WordsWithPos {
  let identicalsMap: IdenticalsMap = {};
  if (identicals) {
    // check type
    if (!Array.isArray(identicals)) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `identicals must be a string[][]`;
      throw err;
    } else {
      identicals.forEach(function(identicalList): void {
        if (!Array.isArray(identicalList)) {
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `identicals must be a string[][]`;
          throw err;
        }
      });
    }

    if (debugHolder) {
      debugHolder.identicals = identicals;
    }

    // do the job
    identicals.forEach(function(identicalList): void {
      const mapTo: string = identicalList.join('_');
      identicalList.forEach(function(identicalElt): void {
        identicalsMap[stemWordForLang(identicalElt, lang)] = mapTo;
      });
    });
  }
  if (debugHolder) {
    debugHolder.identicalsMap = identicalsMap;
  }
  let wordsWithPos: WordsWithPos = {};
  for (var j = 0; j < words.length; j++) {
    const word: string = identicalsMap[words[j]] || words[j];

    if (!wordsWithPos[word]) {
      wordsWithPos[word] = [];
    }
    wordsWithPos[word].push(j);
  }

  return wordsWithPos;
}

export function getScore(wordsWithPos: WordsWithPos): number {
  let score = 0;

  Object.keys(wordsWithPos).forEach(function(word: string): void {
    const positions: number[] = wordsWithPos[word];
    for (var j = 1; j < positions.length; j++) {
      score += 1 / (positions[j] - positions[j - 1]);
    }
  });

  return score;
}

// useful ones

interface IdenticalsMap {
  [key: string]: string;
}

export interface DebugHolder {
  filteredAlt?: string[];
  identicals?: string[][];
  identicalsMap?: IdenticalsMap;
  wordsWithPos?: WordsWithPos;
  score?: number;
}

export function scoreAlternative(
  lang: Languages,
  alternative: string,
  stopWordsToAdd: string[],
  stopWordsToRemove: string[],
  stopWordsOverride: string[],
  identicals: string[][],
  debugHolder: DebugHolder,
): number {

  // console.log(stemmer.stemWord("baby"));

  // console.log(stopWordsToAdd);
  const stopwords: string[] = getStopWords(lang, stopWordsToAdd, stopWordsToRemove, stopWordsOverride);
  // console.log(stopwords);

  const filteredAlt: string[] = [];

  let extractedWords: string[] = extractWords(alternative)
    .map(function(alt: string): string {
      return alt.toLowerCase();
    })
    .filter(function(alt: string): boolean {
      return !stopwords.includes(alt);
    });
  //console.log(extractedWords);

  extractedWords.forEach(function(extractedWord: string): void {
    filteredAlt.push(stemWordForLang(extractedWord, lang));
  });

  if (debugHolder) {
    debugHolder.filteredAlt = filteredAlt;
  }

  let wordsWithPos: WordsWithPos = getWordsWithPos(lang, filteredAlt, identicals, debugHolder);

  if (debugHolder) {
    // only keep ones with > 1 for readability
    debugHolder.wordsWithPos = {};
    Object.keys(wordsWithPos).forEach(function(word): void {
      if (wordsWithPos[word].length > 1) {
        debugHolder.wordsWithPos[word] = wordsWithPos[word];
      }
    });
  }

  // console.log(wordsWithPos);
  // score
  let score: number = getScore(wordsWithPos);
  if (debugHolder) {
    debugHolder.score = score;
  }
  return score;

  // console.log(score);
}

export function getBest(
  lang: Languages,
  alternatives: string[],
  stopWordsToAdd: string[],
  stopWordsToRemove: string[],
  stopWordsOverride: string[],
  identicals: string[][],
): number {
  var scores: number[] = [];

  alternatives.forEach(function(alt): void {
    scores.push(scoreAlternative(lang, alt, stopWordsToAdd, stopWordsToRemove, stopWordsOverride, identicals, null));
  });

  return scores.indexOf(Math.min(...scores));
}
