import { LanguageImpl } from './LanguageImpl';
import { LanguageFrench } from './LanguageFrench';
import { LanguageSpanish } from './LanguageSpanish';
import { LanguageEnglish } from './LanguageEnglish';
import { LanguageItalian } from './LanguageItalian';
import { LanguageGerman } from './LanguageGerman';
import { LanguageOther } from './LanguageOther';
import { buildLanguageCommon } from 'rosaenlg-commons';

export function languageImplfromIso2(iso2: string): LanguageImpl {
  switch (iso2) {
    case 'en': {
      return new LanguageEnglish(buildLanguageCommon(iso2));
    }
    case 'fr': {
      return new LanguageFrench(buildLanguageCommon(iso2));
    }
    case 'de': {
      return new LanguageGerman(buildLanguageCommon(iso2));
    }
    case 'it': {
      return new LanguageItalian(buildLanguageCommon(iso2));
    }
    case 'es': {
      return new LanguageSpanish(buildLanguageCommon(iso2));
    }
    default: {
      return new LanguageOther(buildLanguageCommon(iso2));
    }
  }
}
