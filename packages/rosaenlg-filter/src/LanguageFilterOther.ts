/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from 'rosaenlg-commons';
import { LanguageFilter } from './LanguageFilter';

export class LanguageFilterOther extends LanguageFilter {
  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    this.cleanSpacesPunctuationDoDefault = true;
  }

  protectRawNumbers(input: string): string {
    return input;
  }
}
