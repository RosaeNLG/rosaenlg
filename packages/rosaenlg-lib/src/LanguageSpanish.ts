/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetParams, DetTypes, LanguageImpl, SomeTense, AgreeAdjParams } from './LanguageImpl';
import { getDet as getSpanishDet, Dist as SpanishDist } from 'spanish-determiners';
import { Genders, GendersMF, Numbers } from './NlgLib';
import { ConjParams } from './VerbsManager';
import { agreeAdjective as agreeSpanishAdjective } from 'spanish-adjectives-wrapper';
import { getGenderSpanishWord, getPluralSpanishWord } from 'spanish-words';
import getSpanishOrdinal from 'ordinal-spanish';
import 'numeral/locales/es-es';
import { es as dataFnsEs } from 'date-fns/locale';
import { getConjugation as libGetConjugationEs } from 'spanish-verbs-wrapper';
import { LanguageCommon, VerbsInfo } from 'rosaenlg-commons';
import n2words from '../../rosaenlg-n2words/dist/n2words_ES.js';
import { PersonForSentence } from './SentenceManager';

export class LanguageSpanish extends LanguageImpl {
  iso2 = 'es';
  langForNumeral = 'es-es';
  langForDateFns = dataFnsEs;
  n2wordsLang = 'es';
  n2wordsLib = n2words;
  floatingPointWord = 'coma';
  table0to9 = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  hasGender = true;
  hasNeutral = true;
  defaultAdjPos = 'AFTER';
  defaultTense = 'INDICATIVE_PRESENT';
  defaultLastSeparatorForAdjectives = 'y';
  universalMapping = {
    UNIVERSAL_PRESENT: 'INDICATIVE_PRESENT',
    UNIVERSAL_PAST: 'INDICATIVE_PRETERITE_PERFECT',
    UNIVERSAL_FUTURE: 'INDICATIVE_FUTURE',
    UNIVERSAL_PERFECT: 'INDICATIVE_PERFECT',
    UNIVERSAL_PLUPERFECT: 'INDICATIVE_PLUPERFECT',
  };
  spacesWhenSeparatingElements = true;

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
    tense: SomeTense,
    person: PersonForSentence,
    _conjParams: ConjParams,
    embeddedVerbs: VerbsInfo,
  ): string {
    // one of verbsSpecificList and conjFctEs is always null: it's one or the other
    return libGetConjugationEs(embeddedVerbs, verb, this.solveTense(tense), this.mapPersonToNumber0to5(person));
  }

  isPlural(val: number): boolean {
    // http://udep.edu.pe/castellanoactual/duda-resuelta-felices-pascuas-y-cero-grados/
    if (val === 1 || val === -1) {
      return false;
    } else {
      return true;
    }
  }
}
