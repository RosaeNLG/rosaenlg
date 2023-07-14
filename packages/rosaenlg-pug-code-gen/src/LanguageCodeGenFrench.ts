/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { VerbInfo, WordInfo, AdjectiveInfo } from 'rosaenlg-commons';
import { LanguageCodeGen } from './LanguageCodeGen';
// words
import { getWordInfo } from 'french-words';
import frenchVerbsDict from 'french-verbs-lefff/dist/conjugations.json';
// verbs
import { VerbsInfo } from 'french-verbs-lefff';
import frenchWordsGenderLefff from 'french-words-gender-lefff/dist/words.json';
import { GenderList } from 'french-words-gender-lefff';
// adj
import { getAdjectiveInfo } from 'french-adjectives-wrapper';
import { getVerbInfo } from 'french-verbs';

export class LanguageCodeGenFrench extends LanguageCodeGen {
  iso2 = 'fr';
  hasFlexVerbs = true;
  hasFlexWords = true;
  hasFlexAdjectives = true;

  getVerbInfo(verb: string): VerbInfo {
    return getVerbInfo(frenchVerbsDict as VerbsInfo, verb);
  }
  getWordInfo(word: string): WordInfo {
    return getWordInfo(frenchWordsGenderLefff as GenderList, word);
  }
  getAdjectiveInfo(adjective: string): AdjectiveInfo {
    // NB no need to give an custom list here
    return getAdjectiveInfo(adjective, undefined);
  }
}
