/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { VerbsInfo, VerbInfo, WordsInfo, WordInfo, AdjectivesInfo, AdjectiveInfo } from 'rosaenlg-commons';

export abstract class LanguageCodeGen {
  iso2: string | undefined = undefined;
  hasFlexVerbs: boolean | undefined = undefined;
  hasFlexWords: boolean | undefined = undefined;
  hasFlexAdjectives: boolean | undefined = undefined;

  constructor() {
    // do nothing
  }

  // more of a helper
  getVerbsInfo(verbs: string[]): VerbsInfo {
    const res: VerbsInfo = {};
    for (const verb of verbs) {
      res[verb] = this.getVerbInfo(verb);
    }
    return res;
  }

  getWordsInfo(words: string[]): WordsInfo {
    const res: WordsInfo = {};
    for (const word of words) {
      res[word] = this.getWordInfo(word);
    }
    return res;
  }

  getAdjectivesInfo(adjectives: string[]): AdjectivesInfo {
    const res: AdjectivesInfo = {};
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
