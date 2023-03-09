/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from 'rosaenlg-commons';
import { LanguageFilter } from './LanguageFilter';
import { LanguageFilterFrench } from './LanguageFilterFrench';
import { LanguageFilterSpanish } from './LanguageFilterSpanish';
import { LanguageFilterEnglish } from './LanguageFilterEnglish';
import { LanguageFilterItalian } from './LanguageFilterItalian';
import { LanguageFilterGerman } from './LanguageFilterGerman';
import { LanguageFilterOther } from './LanguageFilterOther';

export function languageFilterFromLanguageCommon(languageCommon: LanguageCommon): LanguageFilter {
  switch (languageCommon.iso2) {
    case 'fr': {
      return new LanguageFilterFrench(languageCommon);
    }
    case 'de': {
      return new LanguageFilterGerman(languageCommon);
    }
    case 'it': {
      return new LanguageFilterItalian(languageCommon);
    }
    case 'en': {
      return new LanguageFilterEnglish(languageCommon);
    }
    case 'es': {
      return new LanguageFilterSpanish(languageCommon);
    }
    default: {
      return new LanguageFilterOther(languageCommon);
    }
  }
}
