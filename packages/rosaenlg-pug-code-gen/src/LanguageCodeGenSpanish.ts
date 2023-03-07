/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { VerbInfo, WordInfo, AdjectiveInfo } from 'rosaenlg-commons';
import { LanguageCodeGen } from './LanguageCodeGen';
import { getAdjectiveInfo } from 'spanish-adjectives-wrapper';
import { getWordInfo } from 'spanish-words';
import { getVerbInfo } from 'spanish-verbs-wrapper';

export class LanguageCodeGenSpanish extends LanguageCodeGen {
  iso2 = 'es';
  hasFlexVerbs = true;
  hasFlexWords = true;
  hasFlexAdjectives = true;

  getVerbInfo(verb: string): VerbInfo {
    return getVerbInfo(verb);
  }
  getWordInfo(word: string): WordInfo {
    return getWordInfo(word);
  }
  getAdjectiveInfo(adjective: string): AdjectiveInfo {
    return getAdjectiveInfo(adjective);
  }
}
