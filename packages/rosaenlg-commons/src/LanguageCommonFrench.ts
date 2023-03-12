/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';
import { Constants } from './Constants';

export class LanguageCommonFrench extends LanguageCommon {
  iso2 = 'fr';
  validPropsWord = ['plural', 'gender', 'contracts'];
  validPropsAdj = ['contracts', 'MS', 'MP', 'FS', 'FP'];
  allPunctList = Constants.stdPunctList + "'";
}
