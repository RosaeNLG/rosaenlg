/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { LanguageCodeGen } from './LanguageCodeGen';
import { LanguageCodeGenEnglish } from './LanguageCodeGenEnglish';
import { LanguageCodeGenFrench } from './LanguageCodeGenFrench';
import { LanguageCodeGenGerman } from './LanguageCodeGenGerman';
import { LanguageCodeGenItalian } from './LanguageCodeGenItalian';
import { LanguageCodeGenSpanish } from './LanguageCodeGenSpanish';
import { LanguageCodeGenOther } from './LanguageCodeGenOther';

// is a duplicate from rosaenlg-commons
export function getIso2fromLocale(locale: string): string {
  return locale.substring(0, 2);
}

export function buildLanguageCodeGen(iso2: string): LanguageCodeGen {
  let languageCodeGen: LanguageCodeGen;
  switch (iso2) {
    case 'en':
      languageCodeGen = new LanguageCodeGenEnglish();
      break;
    case 'fr':
      languageCodeGen = new LanguageCodeGenFrench();
      break;
    case 'de':
      languageCodeGen = new LanguageCodeGenGerman();
      break;
    case 'it':
      languageCodeGen = new LanguageCodeGenItalian();
      break;
    case 'es':
      languageCodeGen = new LanguageCodeGenSpanish();
      break;
    default:
      languageCodeGen = new LanguageCodeGenOther();
      (languageCodeGen as LanguageCodeGenOther).setIso2(iso2);
      break;
  }
  return languageCodeGen;
}
