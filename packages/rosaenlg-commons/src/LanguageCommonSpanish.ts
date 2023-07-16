/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';
import { Constants } from './Constants';

export class LanguageCommonSpanish extends LanguageCommon {
  constructor() {
    super();
    this.iso2 = 'es';
    this.validPropsWord = ['plural', 'gender'];
    this.validPropsAdj = ['MStrue', 'MPtrue', 'FStrue', 'FPtrue', 'MSfalse', 'MPfalse', 'FSfalse', 'FPfalse'];
    this.allPunctList = Constants.stdPunctList + '¡¿';
  }
}
