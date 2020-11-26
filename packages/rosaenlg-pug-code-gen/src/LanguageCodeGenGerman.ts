/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { LanguageCodeGen, VerbInfo, WordInfo, AdjectiveInfo } from './LanguageCodeGen';
import germanWordsDict from 'german-words-dict';
import { getWordInfo } from 'german-words';
import { getAdjectiveInfo } from 'german-adjectives';
import germanAdjectivesDict from 'german-adjectives-dict';
import { getVerbInfo } from 'german-verbs';
import germanVerbsDict from 'german-verbs-dict';

export class LanguageCodeGenGerman extends LanguageCodeGen {
  iso2 = 'de';
  hasFlexVerbs = true;
  hasFlexWords = true;
  hasFlexAdjectives = true;

  getVerbInfo(verb: string): VerbInfo {
    return getVerbInfo(germanVerbsDict, verb);
  }
  getWordInfo(word: string): WordInfo {
    return getWordInfo(germanWordsDict, word);
  }
  getAdjectiveInfo(adjective: string): AdjectiveInfo {
    return getAdjectiveInfo(germanAdjectivesDict, adjective);
  }
}
