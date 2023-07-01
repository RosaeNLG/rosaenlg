/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';
import { Constants } from './Constants';

export class LanguageCommonFrench extends LanguageCommon {
  constructor() {
    super();
    this.iso2 = 'fr';
    this.validPropsWord = ['plural', 'gender', 'contracts'];
    this.validPropsAdj = ['contracts', 'MS', 'MP', 'FS', 'FP'];
    this.allPunctList = Constants.stdPunctList + "'";
  }
}
