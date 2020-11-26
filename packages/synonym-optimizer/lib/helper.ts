/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';
import { LanguageSynEnglish } from './LanguageSynEnglish';
import { LanguageSynFrench } from './LanguageSynFrench';
import { LanguageSynGerman } from './LanguageSynGerman';
import { LanguageSynItalian } from './LanguageSynItalian';
import { LanguageSynSpanish } from './LanguageSynSpanish';
import { LanguageSynOther } from './LanguageSynOther';

// duplicate
export function getIso2fromLocale(locale: string): string {
  return locale.substring(0, 2);
}

export function buildLanguageSyn(iso2: string): LanguageSyn {
  let languageSyn: LanguageSyn;
  switch (iso2) {
    case 'en':
      languageSyn = new LanguageSynEnglish();
      break;
    case 'fr':
      languageSyn = new LanguageSynFrench();
      break;
    case 'de':
      languageSyn = new LanguageSynGerman();
      break;
    case 'it':
      languageSyn = new LanguageSynItalian();
      break;
    case 'es':
      languageSyn = new LanguageSynSpanish();
      break;
    default:
      languageSyn = new LanguageSynOther();
      languageSyn.iso2 = iso2;
      break;
  }
  return languageSyn;
}
