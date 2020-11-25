/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';

export class LanguageCommonItalian extends LanguageCommon {
  iso2 = 'it';
  validPropsWord = ['G', 'S', 'P'];
  validPropsAdj = ['MS', 'MP', 'FS', 'FP'];

  isConsonneImpure(word: string): boolean {
    const wordLc = word.toLowerCase();

    const begins = ['ps', 'pn', 'gn', 'x', 'z'];
    for (let i = 0; i < begins.length; i++) {
      //console.log(`${word} start with ${begins[i]}?`);
      if (wordLc.startsWith(begins[i])) {
        //console.log(`isConsonneImpure ${word}? => true`);
        return true;
      }
    }
    // s impur (autrement dit un s suivi d'une autre consonne)
    const regexSImpur = new RegExp('^s[' + this.constants.toutesConsonnes + ']');
    if (regexSImpur.test(wordLc)) {
      //console.log(`isConsonneImpure ${word}? => true`);
      return true;
    }
    //console.log(`isConsonneImpure ${word}? => false`);
    return false;
  }

  isIFollowedByVowel(word: string): boolean {
    const regexISuiviVoyelle = new RegExp('^[IiYy][' + this.constants.toutesVoyellesMinuscules + ']');
    if (regexISuiviVoyelle.test(word)) {
      return true;
    }
    return false;
  }

  startsWithVowel(word: string): boolean {
    const regexVowel = new RegExp('^[' + this.constants.toutesVoyellesMinuscules + ']');
    if (regexVowel.test(word.toLowerCase())) {
      return true;
    }
    return false;
  }
}
