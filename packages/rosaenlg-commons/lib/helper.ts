/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';
import { LanguageCommonEnglish } from './LanguageCommonEnglish';
import { LanguageCommonFrench } from './LanguageCommonFrench';
import { LanguageCommonGerman } from './LanguageCommonGerman';
import { LanguageCommonItalian } from './LanguageCommonItalian';
import { LanguageCommonSpanish } from './LanguageCommonSpanish';
import { LanguageCommonOther } from './LanguageCommonOther';

// should be better
export function getIso2fromLocale(locale: string): string {
  if (locale && locale.length == 5) {
    return locale.substring(0, 2);
  } else {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = `${locale} is not a valid locale, should be xx_YY (e.g. en_US)`;
    throw err;
  }
}

export function buildLanguageCommon(iso2: string): LanguageCommon {
  let languageCommon: LanguageCommon;
  switch (iso2) {
    case 'en':
      languageCommon = new LanguageCommonEnglish();
      languageCommon.init();
      break;
    case 'fr':
      languageCommon = new LanguageCommonFrench();
      languageCommon.init();
      break;
    case 'de':
      languageCommon = new LanguageCommonGerman();
      languageCommon.init();
      break;
    case 'it':
      languageCommon = new LanguageCommonItalian();
      languageCommon.init();
      break;
    case 'es':
      languageCommon = new LanguageCommonSpanish();
      languageCommon.init();
      break;
    default:
      languageCommon = new LanguageCommonOther();
      languageCommon.setIso2(iso2);
      languageCommon.init();
      break;
  }
  return languageCommon;
}
