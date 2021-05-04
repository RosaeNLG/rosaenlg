/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetTypes, DetParams, LanguageImpl, SomeTense, Numbers, GrammarParsed } from './LanguageImpl';
import { ValueParams } from './ValueManager';
import { SpyI } from './Spy';
import { GenderNumberManager } from './GenderNumberManager';
import { ConjParams } from './VerbsManager';
import { VerbsData } from 'rosaenlg-pug-code-gen';
import { getDet as getEnglishDet, Dist as EnglishDist } from 'english-determiners';
import { getOrdinal as getEnglishOrdinal } from 'english-ordinals';
import englishPluralsList from 'english-plurals-list/dist/plurals.json';
import { getPlural } from 'english-plurals';
import { parse as englishParse } from '../dist/english-grammar.js';
import {
  getConjugation as libGetConjugationEn,
  ExtraParams as ExtraParamsEn,
  mergeVerbsData as mergeVerbsDataEn,
} from 'english-verbs-helper';
import englishVerbsIrregular from 'english-verbs-irregular/dist/verbs.json';
import englishVerbsGerunds from 'english-verbs-gerunds/dist/gerunds.json';
import { LanguageCommon, VerbsInfo } from 'rosaenlg-commons';
import { enUS as dataFnsEnUs } from 'date-fns/locale';
import n2words from '../../rosaenlg-n2words/dist/n2words_EN.js';

interface ConjParamsEn extends ConjParams, ExtraParamsEn {
  tense: string;
}

type PossForm = 'OF' | 'S';

export class LanguageEnglish extends LanguageImpl {
  iso2 = 'en';
  langForNumeral = 'en';
  langForDateFns = dataFnsEnUs;
  n2wordsLang = 'en';
  n2wordsLib = n2words;
  floatingPointWord = 'point';
  table0to9 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  hasGender = false;
  hasNeutral = true;
  defaultAdjPos = 'BEFORE';
  defaultTense = 'PRESENT';
  defaultLastSeparatorForAdjectives = 'and';
  universalMapping = {
    UNIVERSAL_PRESENT: 'SIMPLE_PRESENT',
    UNIVERSAL_PAST: 'SIMPLE_PAST',
    UNIVERSAL_FUTURE: 'SIMPLE_FUTURE',
    UNIVERSAL_PERFECT: 'PERFECT_PRESENT',
    UNIVERSAL_PLUPERFECT: 'PERFECT_PAST',
  };

  private mergedVerbsDataEn: VerbsInfo;

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    // create English combined resource
    this.mergedVerbsDataEn = mergeVerbsDataEn(englishVerbsIrregular, englishVerbsGerunds);
  }

  getDet(det: DetTypes, params: DetParams): string {
    return getEnglishDet(
      det,
      params.genderOwner,
      params.numberOwner || 'S',
      params.numberOwned || 'S',
      params.dist as EnglishDist,
      params.useTheWhenPlural,
    );
  }

  getAgreeAdj(adjective: string /*, gender: Genders, number: Numbers, subject: any, params: AgreeAdjParams*/): string {
    // no agreement for adjectives in English
    return adjective;
  }

  getOrdinal(val: number): string {
    return getEnglishOrdinal(val);
  }

  getSubstantive(subst: string, number: Numbers): string {
    if (number === 'S') {
      return subst;
    } else {
      return getPlural(this.getDictManager().getWordData(), englishPluralsList, subst);
    }
  }

  parseSimplifiedString(val: string): GrammarParsed {
    return englishParse(val, {
      /* no dict */
    });
  }

  thirdPossessionTriggerRef(
    owner: any,
    owned: any,
    params: {
      possForm: PossForm;
    },
    spy: SpyI,
  ): void {
    let possForm: PossForm;
    if (params && params.possForm) {
      if (params.possForm === 'OF' || params.possForm === 'S') {
        possForm = params.possForm;
      } else {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `possForm must be either OF or S`;
        throw err;
      }
    } else {
      possForm = 'OF';
    }

    switch (possForm) {
      case 'OF': {
        this.valueManager.value(owned, (Object.assign({}, params, { det: 'DEFINITE' }) as unknown) as ValueParams);
        spy.appendPugHtml(` of `);
        this.valueManager.value(owner, (Object.assign({}, params) as unknown) as ValueParams);
        break;
      }
      case 'S': {
        this.valueManager.value(owner, (Object.assign({}, params) as unknown) as ValueParams);
        spy.appendPugHtml(`'s`);
        this.valueManager.value(owned, (Object.assign({}, params) as unknown) as ValueParams);
        break;
      }
    }
  }

  thirdPossessionRefTriggered(
    owner: any,
    owned: any,
    params: any,
    spy: SpyI,
    genderNumberManager: GenderNumberManager,
  ): void {
    const det: string = this.getDet('POSSESSIVE', {
      genderOwned: null,
      genderOwner: genderNumberManager.getRefGender(owner, params),
      numberOwner: genderNumberManager.getRefNumber(owner, params),
      numberOwned: null, // we do not care
      case: null,
      dist: null,
      after: null,
    });

    spy.appendPugHtml(` ${det} ${owned} `);
  }

  recipientPossession(owned: any, spy: SpyI): void {
    spy.appendPugHtml('your');
    this.valueManager.value(owned, ({ _OWNER: true } as unknown) as ValueParams);
  }

  getConjugation(
    _subject: any,
    verb: string,
    tense: SomeTense,
    number: Numbers,
    conjParams: ConjParamsEn,
    _genderNumberManager: GenderNumberManager,
    embeddedVerbs: VerbsData,
  ): string {
    return libGetConjugationEn(
      embeddedVerbs || this.mergedVerbsDataEn,
      verb,
      this.solveTense(tense),
      number,
      conjParams,
    );
  }

  isPlural(val: number): boolean {
    if (val === 1 || val === -1) {
      return false;
    } else {
      return true;
    }
  }
}
