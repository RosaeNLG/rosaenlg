/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from 'rosaenlg-commons';
import { LanguageFilter } from './LanguageFilter';

export class LanguageFilterSpanish extends LanguageFilter {
  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    this.cleanSpacesPunctuationDoDefault = true;
  }

  protectRawNumbers(input: string): string {
    let res = input;
    const regexNumber = new RegExp(
      `([^\\d])${this.constants.stdBeforeWithParenthesis}((\\d{1,3}(?:\\.\\d{3})*|(?:\\d+))(?:\\,\\d+)?)`,
      'g',
    );
    res = res.replace(regexNumber, (_match, before1, before2, content): string => {
      return before1 + before2 + '<protect>' + content + '</protect>';
    });
    return res;
  }

  contractions(input: string): string {
    let res = input;

    // de + el => del
    res = this.contract2elts('de', 'el', 'del', res);

    // a + el => al
    res = this.contract2elts('a', 'el', 'al', res);

    return res;
  }

  cleanSpacesPunctuation(input: string): string {
    let res = input;

    const regexSpanishPunct = new RegExp(`([¡¿])(${this.constants.spaceOrNonBlockingClass}*)`, 'g');
    res = res.replace(regexSpanishPunct, (_match, punct, after): string => {
      return `${punct}${after.replace(/\s/g, '')}`;
    });

    return res;
  }

  addCapsSpecific(input: string): string {
    let res = input;

    const triggerCapsNoSpace = '[¡¿]';
    const regexCapsAfterDot = new RegExp(
      `(${triggerCapsNoSpace})(${this.constants.spaceOrNonBlockingClass}*)([${this.constants.tousCaracteresMinMajRe}])`,
      'g',
    );
    res = res.replace(regexCapsAfterDot, (_match, punct, before, firstWord): string => {
      // same as above but without added space
      return `${punct}${before.replace(/\s/g, '')}${firstWord.toUpperCase()}`;
    });

    return res;
  }
}
