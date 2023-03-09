/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';
import { Constants } from './Constants';

export class LanguageCommonSpanish extends LanguageCommon {
  iso2 = 'es';
  validPropsWord = ['plural', 'gender'];
  validPropsAdj = ['MStrue', 'MPtrue', 'FStrue', 'FPtrue', 'MSfalse', 'MPfalse', 'FSfalse', 'FPfalse'];
  allPunctList = Constants.stdPunctList + '¡¿';
}
