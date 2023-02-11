/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageFilter } from './LanguageFilter';

export class LanguageFilterGerman extends LanguageFilter {
  cleanSpacesPunctuationDoDefault = true;

  // same as in French
  protectRawNumbers(input: string): string {
    let res = input;
    const regexNumber = new RegExp(
      `([^\\d])${this.constants.stdBeforeWithParenthesis}((\\d{1,3}(?:\\s\\d{3})*|(?:\\d+))(?:,\\d+)?)`,
      'g',
    );
    res = res.replace(regexNumber, (_match, before1, before2, content): string => {
      return before1 + before2 + '<protect>' + content + '</protect>';
    });
    return res;
  }
}
