/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


import { DetTypes, DetParams, LanguageImpl, Numbers, GrammarParsed } from './LanguageImpl';
import { GenderNumberManager } from './GenderNumberManager';
import { ConjParams } from './VerbsManager';
import { VerbsData } from 'rosaenlg-pug-code-gen';
import { getDet as getEnglishDet, Dist as EnglishDist } from 'english-determiners';
import { getOrdinal as getEnglishOrdinal } from 'english-ordinals';
import englishPluralsList from 'english-plurals-list';
import { getPlural } from 'english-plurals';
import { parse as englishParse } from '../dist/english-grammar.js';
import {
  getConjugation as libGetConjugationEn,
  ExtraParams as ExtraParamsEn,
  mergeVerbsData as mergeVerbsDataEn,
} from 'english-verbs-helper';
import englishVerbsIrregular from 'english-verbs-irregular';
import englishVerbsGerunds from 'english-verbs-gerunds';
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
    spy: Spy,
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
        spy.getPugMixins().value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
        spy.appendPugHtml(` of `);
        spy.getPugMixins().value(owner, Object.assign({}, params));
        break;
      }
      case 'S': {
        spy.getPugMixins().value(owner, Object.assign({}, params));
        spy.appendPugHtml(`'s`);
        spy.getPugMixins().value(owned, Object.assign({}, params));
        break;
      }
    }
  }

  thirdPossessionRefTriggered(
    owner: any,
    owned: any,
    params: any,
    spy: Spy,
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

  recipientPossession(owned: any, spy: Spy): void {
    spy.appendPugHtml('your');
    spy.getPugMixins().value(owned, { _OWNER: true });
  }

  getConjugation(
    _subject: any,
    verb: string,
    tense: string,
    number: Numbers,
    conjParams: ConjParamsEn,
    _genderNumberManager: GenderNumberManager,
    embeddedVerbs: VerbsData,
  ): string {
    return libGetConjugationEn(embeddedVerbs || this.mergedVerbsDataEn, verb, tense, number, conjParams);
  }
}
