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
    for (let i = 0; i < verbs.length; i++) {
      res[verbs[i]] = this.getVerbInfo(verbs[i]);
    }
    return res;
  }

  getWordsInfo(words: string[]): WordsInfo {
    const res = {};
    for (let i = 0; i < words.length; i++) {
      res[words[i]] = this.getWordInfo(words[i]);
    }
    return res;
  }

  getAdjectivesInfo(adjectives: string[]): AdjectivesInfo {
    const res = {};
    for (let i = 0; i < adjectives.length; i++) {
      res[adjectives[i]] = this.getAdjectiveInfo(adjectives[i]);
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
