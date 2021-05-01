/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetParams, DetTypes, LanguageImpl, AgreeAdjParams, GrammarParsed } from './LanguageImpl';
import { GenderNumberManager } from './GenderNumberManager';
import { ValueParams } from './ValueManager';
import { Genders, Numbers } from './NlgLib';
import { VerbsData } from 'rosaenlg-pug-code-gen';
import { getDet as getGermanDet } from 'german-determiners';
import { agreeGermanAdjective, DetTypes as GermanDetTypes } from 'german-adjectives';
import { AdjectivesInfo as GermanAdjectivesInfo } from 'german-adjectives-dict';
import germanAdjectivesDict from 'german-adjectives-dict/dist/adjectives.json';
import { getCaseGermanWord, getGenderGermanWord } from 'german-words';
import germanWordsDict from 'german-words-dict/dist/words.json';
import { WordsInfo as GermanWordsInfo } from 'german-words-dict';
import { getOrdinal as getGermanOrdinal } from 'german-ordinals';
import 'numeral/locales/de';
import { de as dataFnsDe } from 'date-fns/locale';
import { parse as germanParse } from '../dist/german-grammar.js';
import { GermanDictHelper } from 'german-dict-helper';
import { ConjParams, VerbParts } from './VerbsManager';
import { getConjugation as libGetConjugationDe, GermanAux, PronominalCase } from 'german-verbs';
import germanVerbsDict from 'german-verbs-dict/dist/verbs.json';
import { LanguageCommon } from 'rosaenlg-commons';
import n2words from '../../rosaenlg-n2words/dist/n2words_DE.js';
import { Helper } from './Helper';

export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';

interface ConjParamsDe extends ConjParams {
  tense: string;
  pronominalCase: PronominalCase;
  aux: GermanAux;
}

export class LanguageGerman extends LanguageImpl {
  iso2 = 'de';
  langForNumeral = 'de';
  langForDateFns = dataFnsDe;
  n2wordsLang = 'de';
  n2wordsLib = n2words;
  floatingPointWord = 'Komma';
  table0to9 = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  hasGender = true;
  hasNeutral = true;
  defaultAdjPos = 'BEFORE';
  hasCase = true;
  defaultCase = 'NOMINATIVE';
  userGenderOwnedForGender = true;
  supportsInvertSubjectVerb = true;
  defaultTense = 'PRASENS';
  canPopVerbPart = true;
  defaultLastSeparatorForAdjectives = 'und';

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    try {
      this.dictHelper = new GermanDictHelper();
    } catch (err) {
      // this means that we are in a browser
    }
  }

  getDet(det: DetTypes, params: DetParams): string {
    return getGermanDet(
      det,
      params.case as GermanCases,
      params.genderOwner,
      params.numberOwner || 'S',
      params.genderOwned,
      params.numberOwned || 'S',
    );
  }

  getAgreeAdj(adjective: string, gender: Genders, number: Numbers, _subject: any, params: AgreeAdjParams): string {
    return agreeGermanAdjective(
      this.getDictManager().getAdjsData(),
      germanAdjectivesDict as GermanAdjectivesInfo, //NOSONAR
      adjective,
      params.case as GermanCases,
      gender,
      number,
      params.det as GermanDetTypes,
    );
  }

  getWordGender(word: string): Genders {
    return getGenderGermanWord(this.getDictManager().getWordData(), germanWordsDict as GermanWordsInfo, word); //NOSONAR
  }

  getOrdinal(val: number, _gender: Genders): string {
    return getGermanOrdinal(val);
  }

  getSubstantive(subst: string, number: Numbers, theCase: GermanCases): string {
    if (number === 'S' && theCase === 'NOMINATIVE') {
      return subst;
    } else {
      return getCaseGermanWord(
        this.getDictManager().getWordData(),
        germanWordsDict as GermanWordsInfo,
        subst,
        theCase,
        number,
      ); //NOSONAR
    }
  }

  parseSimplifiedString(val: string): GrammarParsed {
    return germanParse(val, { dictHelper: this.dictHelper });
  }

  thirdPossessionTriggerRef(owner: any, owned: any, params: any, spy: Spy, helper: Helper): void {
    this.valueManager.value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
    helper.appendDoubleSpace();
    this.valueManager.value(owner, Object.assign({}, params, { case: 'GENITIVE' }));
  }

  thirdPossessionRefTriggered(
    owner: any,
    owned: any,
    params: any,
    spy: Spy,
    genderNumberManager: GenderNumberManager,
  ): void {
    const germanCase: 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE' =
      params && params.case ? params.case : 'NOMINATIVE';

    const det: string = this.getDet('POSSESSIVE', {
      genderOwner: genderNumberManager.getRefGender(owner, params),
      numberOwner: genderNumberManager.getRefNumber(owner, params),
      genderOwned: genderNumberManager.getRefGender(owned, params),
      numberOwned: genderNumberManager.getRefNumber(owned, params),
      case: germanCase,
      dist: null,
      after: null,
    });

    /*
      3. flex the word
      getCaseGermanWord always returns something (not null)
      UNSURE ABOUT numberOwned / owner?
    */
    const declinedWord: string = getCaseGermanWord(
      this.getDictManager().getWordData(),
      germanWordsDict as GermanWordsInfo, //NOSONAR
      owned,
      germanCase,
      genderNumberManager.getRefNumber(owner, params) || 'S',
    );

    spy.appendPugHtml(` ${det} ${declinedWord} `);
  }

  getConjugation(
    _subject: any,
    verb: string,
    tense: string,
    number: Numbers,
    conjParams: ConjParamsDe,
    _genderNumberManager: GenderNumberManager,
    embeddedVerbs: VerbsData,
    verbParts: VerbParts,
  ): string {
    const tensesWithParts: string[] = [
      'FUTUR1',
      'FUTUR2',
      'PERFEKT',
      'PLUSQUAMPERFEKT',
      'KONJUNKTIV1_FUTUR1',
      'KONJUNKTIV1_PERFEKT',
      'KONJUNKTIV2_FUTUR1',
      'KONJUNKTIV2_FUTUR2',
    ];

    let pronominal = false;
    let pronominalCase: PronominalCase;
    if (conjParams && conjParams.pronominal) {
      pronominal = true;
      pronominalCase = conjParams.pronominalCase;
    }

    if (tensesWithParts.indexOf(tense) > -1) {
      // 'wird sein'

      // istanbul ignore next
      const aux: 'SEIN' | 'HABEN' = conjParams ? conjParams.aux : null;
      const conjElts: string[] = libGetConjugationDe(
        embeddedVerbs || germanVerbsDict,
        verb,
        tense,
        3,
        number,
        aux,
        pronominal,
        pronominalCase,
      );
      verbParts.push(conjElts.slice(1).join('¤')); // FUTUR2: 'wird gedacht haben'
      return conjElts[0];
    } else {
      return libGetConjugationDe(
        embeddedVerbs || germanVerbsDict,
        verb,
        tense,
        3,
        number,
        null,
        pronominal,
        pronominalCase,
      ).join('¤');
    }
  }

  isPlural(val: number): boolean {
    // https://german.stackexchange.com/questions/26806/numerus-beim-zahlenwort-null
    // looks the same as in English
    if (val === 1 || val === -1) {
      return false;
    } else {
      return true;
    }
  }
}
