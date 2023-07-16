/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';

export class LanguageCommonEnglish extends LanguageCommon {
  constructor() {
    super();
    this.iso2 = 'en';
    this.validPropsWord = ['plural', 'aan'];
    this.validPropsAdj = ['aan'];
  }
}
