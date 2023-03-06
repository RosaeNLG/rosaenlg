/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageImpl } from './LanguageImpl';
import { LanguageCommon } from 'rosaenlg-commons';

export class LanguageChinese extends LanguageImpl {
  iso2 = 'zh';
  spacesWhenSeparatingElements = false;

  // is mandatory, but certainly false here?
  /* istanbul ignore next */
  getSubstantive(subst: string /*, number: Numbers*/): string {
    return subst;
  }

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    this.iso2 = languageCommon.iso2;
  }
}
