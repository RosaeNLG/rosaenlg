/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

// copy of rosaenlg-commons
export type VerbInfo = any;
export interface VerbsInfo {
  [key: string]: VerbInfo;
}
export type WordInfo = any;
export interface WordsInfo {
  [key: string]: WordInfo;
}
export type AdjectiveInfo = any;
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

export abstract class LanguageCodeGen {
  iso2: string;
  hasFlexVerbs: boolean;
  hasFlexWords: boolean;
  hasFlexAdjectives: boolean;

  constructor() {
    // do nothing
  }

  // more of a helper
  getVerbsInfo(verbs: string[]): VerbsInfo {
    const res = {};
    for (const verb of verbs) {
      res[verb] = this.getVerbInfo(verb);
    }
    return res;
  }

  getWordsInfo(words: string[]): WordsInfo {
    const res = {};
    for (const word of words) {
      res[word] = this.getWordInfo(word);
    }
    return res;
  }

  getAdjectivesInfo(adjectives: string[]): AdjectivesInfo {
    const res = {};
    for (const adjective of adjectives) {
      res[adjective] = this.getAdjectiveInfo(adjective);
    }
    return res;
  }

  // istanbul ignore next
  getVerbInfo(_verb: string): VerbInfo {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = `cannot getVerbInfo in ${this.iso2}`;
    throw err;
  }
  // istanbul ignore next
  getWordInfo(_word: string): WordInfo {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = `cannot getWordInfo in ${this.iso2}`;
    throw err;
  }
  // istanbul ignore next
  getAdjectiveInfo(_adjective: string): AdjectiveInfo {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = `cannot getAdjectiveInfo in ${this.iso2}`;
    throw err;
  }
}
