/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';

export class LanguageCommonGerman extends LanguageCommon {
  constructor() {
    super();
    this.iso2 = 'de';
    this.validPropsWord = ['G', 'DAT', 'GEN', 'AKK', 'NOM']; // TODO check 1 level deeper SIN PLU
    this.validPropsAdj = ['AKK', 'DAT', 'GEN', 'NOM']; // TODO check 1 level deeper
  }
}
