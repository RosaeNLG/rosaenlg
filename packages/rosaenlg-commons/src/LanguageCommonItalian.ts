/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Constants } from './Constants';
import { LanguageCommon } from './LanguageCommon';

export class LanguageCommonItalian extends LanguageCommon {
  constructor() {
    super();
    this.iso2 = 'it';
    this.validPropsWord = ['G', 'S', 'P'];
    this.validPropsAdj = ['MS', 'MP', 'FS', 'FP'];
  }

  isConsonneImpure(word: string): boolean {
    const wordLc = word.toLowerCase();

    const begins = ['ps', 'pn', 'gn', 'x', 'z'];
    for (const begin of begins) {
      if (wordLc.startsWith(begin)) {
        return true;
      }
    }
    // s impur (autrement dit un s suivi d'une autre consonne)
    const regexSImpur = new RegExp('^s[' + (this.constants as Constants).toutesConsonnes + ']');
    if (regexSImpur.test(wordLc)) {
      return true;
    }
    return false;
  }

  isIFollowedByVowel(word: string): boolean {
    const regexISuiviVoyelle = new RegExp('^[IiYy][' + (this.constants as Constants).toutesVoyellesMinuscules + ']');
    if (regexISuiviVoyelle.test(word)) {
      return true;
    }
    return false;
  }

  startsWithVowel(word: string): boolean {
    const regexVowel = new RegExp('^[' + (this.constants as Constants).toutesVoyellesMinuscules + ']');
    if (regexVowel.test(word.toLowerCase())) {
      return true;
    }
    return false;
  }
}
