/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { VerbInfo, WordInfo, AdjectiveInfo } from 'rosaenlg-commons';
import { LanguageCodeGen } from './LanguageCodeGen';
import { getAdjectiveInfo } from 'italian-adjectives';
import italianAdjectivesDict from 'italian-adjectives-dict/dist/adjectives.json';
import { AdjectivesInfo } from 'italian-adjectives-dict';
import { getWordInfo } from 'italian-words';
import { WordsInfo } from 'italian-words-dict';
import italianWordsDict from 'italian-words-dict/dist/words.json';
import { getVerbInfo } from 'italian-verbs';
import { VerbsInfo } from 'italian-verbs-dict';
import italianVerbsDict from 'italian-verbs-dict/dist/verbs.json';

export class LanguageCodeGenItalian extends LanguageCodeGen {
  iso2 = 'it';
  hasFlexVerbs = true;
  hasFlexWords = true;
  hasFlexAdjectives = true;

  getVerbInfo(verb: string): VerbInfo {
    return getVerbInfo(italianVerbsDict as VerbsInfo, verb);
  }
  getWordInfo(word: string): WordInfo {
    return getWordInfo(italianWordsDict as WordsInfo, word);
  }
  getAdjectiveInfo(adjective: string): AdjectiveInfo {
    return getAdjectiveInfo(italianAdjectivesDict as AdjectivesInfo, adjective);
  }
}
