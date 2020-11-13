import { DetParams, DetTypes, LanguageImpl, AgreeAdjParams } from './LanguageImpl';
import { getDet as getSpanishDet, Dist as SpanishDist } from 'spanish-determiners';
import { GenderNumberManager } from './GenderNumberManager';
import { Genders, GendersMF, Numbers } from './NlgLib';
import { VerbsData } from 'rosaenlg-pug-code-gen';
import { ConjParams } from './VerbsManager';
import { agreeAdjective as agreeSpanishAdjective } from 'spanish-adjectives-wrapper';
import { getGenderSpanishWord } from 'spanish-words';
import getSpanishOrdinal from 'ordinal-spanish';
import { getPluralSpanishWord } from 'spanish-words';
import 'numeral/locales/es-es';
import 'moment/locale/es';
import { SpanishTense, getConjugation as libGetConjugationEs } from 'spanish-verbs-wrapper';
import { LanguageCommon } from 'rosaenlg-commons';

export class LanguageSpanish extends LanguageImpl {
  iso2 = 'es';
  langForNumeral = 'es-es';
  langForMoment = 'es-ES';
  n2wordsLang = 'es';
  floatingPointWord = 'coma';
  table0to9 = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  hasGender = true;
  hasNeutral = true;
  defaultAdjPos = 'AFTER';
  defaultTense = 'INDICATIVE_PRESENT';
  defaultLastSeparatorForAdjectives = 'y';

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
  }

  getDet(det: DetTypes, params: DetParams): string {
    return getSpanishDet(det, params.genderOwned, params.numberOwned, params.after, params.dist as SpanishDist);
  }

  getAgreeAdj(adjective: string, gender: Genders, number: Numbers, _subject: any, params: AgreeAdjParams): string {
    return agreeSpanishAdjective(
      this.getDictManager().getAdjsData(),
      adjective,
      gender as GendersMF,
      number,
      params && params.adjPos === 'BEFORE' ? true : false,
    );
  }
  getWordGender(word: string): Genders {
    return getGenderSpanishWord(this.getDictManager().getWordData(), word);
  }

  getOrdinal(val: number, gender: Genders): string {
    return getSpanishOrdinal(val, gender == 'M' ? 'male' : 'female');
  }

  getSubstantive(subst: string, number: Numbers): string {
    if (number === 'S') {
      return subst;
    } else {
      return getPluralSpanishWord(this.getDictManager().getWordData(), subst);
    }
  }

  getConjugation(
    _subject: any,
    verb: string,
    tense: SpanishTense,
    number: Numbers,
    _conjParams: ConjParams,
    _genderNumberManager: GenderNumberManager,
    embeddedVerbs: VerbsData,
  ): string {
    // one of verbsSpecificList and conjFctEs is always null: it's one or the other
    return libGetConjugationEs(embeddedVerbs, verb, tense, number);
  }
}
