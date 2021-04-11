/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { LanguageCodeGen, WordInfo, VerbInfo } from './LanguageCodeGen';
import { getPlural } from 'english-plurals';
import englishPluralsList from 'english-plurals-list/dist/plurals.json';
import englishVerbsIrregular from 'english-verbs-irregular/dist/verbs.json';
import englishVerbsGerunds from 'english-verbs-gerunds/dist/gerunds.json';
import { mergeVerbsData as mergeVerbsDataEn, VerbsInfo, getVerbInfo } from 'english-verbs-helper';

export class LanguageCodeGenEnglish extends LanguageCodeGen {
  iso2 = 'en';
  hasFlexVerbs = true;
  hasFlexWords = true; // is meaningless for setRefGender, but useful for plurals, in value
  hasFlexAdjectives = false;

  private mergedVerbsDataEn: VerbsInfo;

  constructor() {
    super();
    this.mergedVerbsDataEn = mergeVerbsDataEn(englishVerbsIrregular, englishVerbsGerunds);
  }

  getVerbInfo(verb: string): VerbInfo {
    return getVerbInfo(this.mergedVerbsDataEn, verb);
  }

  getWordInfo(word: string): WordInfo {
    return { plural: getPlural(null, englishPluralsList, word) };
  }
}
