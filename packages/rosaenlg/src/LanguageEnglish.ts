/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Genders, Numbers } from './NlgLib';
import { DetTypes, DetParams, LanguageImpl, SomeTense, GrammarParsed } from './LanguageImpl';
import { ValueParams } from './ValueManager';
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
  Person as VerbPersons,
} from 'english-verbs-helper';
import englishVerbsIrregular from 'english-verbs-irregular/dist/verbs.json';
import englishVerbsGerunds from 'english-verbs-gerunds/dist/gerunds.json';
import { LanguageCommon, VerbsInfo } from 'rosaenlg-commons';
import { enUS as dataFnsEnUs } from 'date-fns/locale';
import n2words from '../../rosaenlg-n2words/dist/n2words_EN.js';
import { SentenceParams, VerbalGroup } from './SentenceManager';

interface SentenceParamsEn extends SentenceParams {
  contractNegation?: boolean;
  negationNoDo?: boolean;
}

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
  spacesWhenSeparatingElements = true;

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
        this.spy.appendPugHtml(` of `);
        this.valueManager.value(owner, (Object.assign({}, params) as unknown) as ValueParams);
        break;
      }
      case 'S': {
        this.valueManager.value(owner, (Object.assign({}, params) as unknown) as ValueParams);
        this.spy.appendPugHtml(`'s`);
        this.valueManager.value(owned, (Object.assign({}, params) as unknown) as ValueParams);
        break;
      }
    }
  }

  thirdPossessionRefTriggered(owner: any, owned: any, params: any): void {
    const det: string = this.getDet('POSSESSIVE', {
      genderOwned: null,
      genderOwner: this.genderNumberManager.getRefGender(owner, params),
      numberOwner: this.genderNumberManager.getRefNumber(owner, params),
      numberOwned: null, // we do not care
      case: null,
      dist: null,
      after: null,
    });

    this.spy.appendPugHtml(` ${det} ${owned} `);
  }

  recipientPossession(owned: any): void {
    this.spy.appendPugHtml('your');
    this.valueManager.value(owned, ({ _OWNER: true } as unknown) as ValueParams);
  }

  getConjugation(
    _subject: any,
    verb: string,
    tense: SomeTense,
    number: Numbers,
    conjParams: ConjParamsEn,
    embeddedVerbs: VerbsData,
  ): string {
    let person: VerbPersons;
    if (number === 'P') {
      person = 5;
    } else {
      person = 2;
    }
    return libGetConjugationEn(
      embeddedVerbs || this.mergedVerbsDataEn,
      verb,
      this.solveTense(tense),
      person,
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

  getObjectPronoun(gender: Genders, number: Numbers): string {
    if (number === 'P') {
      return 'them';
    } else {
      switch (gender) {
        case 'M':
          return 'him';
        case 'F':
          return 'her';
        default:
          // N
          return 'it';
      }
    }
  }

  sentence(sentenceParams: SentenceParamsEn): void {
    const subject = sentenceParams.subjectGroup.subject;
    const verbalGroup: VerbalGroup = sentenceParams.verbalGroup;

    const hasVerb = verbalGroup && verbalGroup.verb;

    const objGroups = sentenceParams.objGroups != null ? sentenceParams.objGroups : [];

    // subject
    this.sentenceDoSubject(sentenceParams.subjectGroup);

    // verb
    if (hasVerb) {
      const modifiedVerbalGroup = { ...verbalGroup } as ConjParamsEn;
      if (sentenceParams.negative) {
        modifiedVerbalGroup.NEGATIVE = true;
        modifiedVerbalGroup.CONTRACT = sentenceParams.contractNegation;
        modifiedVerbalGroup.NO_DO = sentenceParams.negationNoDo;
      }
      this.valueManager.value(this.verbsManager.getAgreeVerb(subject, modifiedVerbalGroup, null), null);
      this.addSeparatingSpace();
    }

    const reorderedObjGroups = [...objGroups];

    /*
      if an indirect object in normal form is followed by a direct object in pronoun form: we do invert
      e.g. 'he gave the neighbor apples' => 'he gave them to the neighbor' (or not 'he gave the neighbor them')
    */
    for (let i = 0; i < reorderedObjGroups.length; i++) {
      const objGroup = reorderedObjGroups[i];
      if (i >= 1 && objGroup.type === 'DIRECT' && this.refsManager.hasTriggeredRef(objGroup.obj)) {
        const precObjGroup = reorderedObjGroups[i - 1];
        if (precObjGroup.type === 'INDIRECT' && !this.refsManager.hasTriggeredRef(precObjGroup.obj)) {
          reorderedObjGroups[i - 1] = objGroup;
          reorderedObjGroups[i] = precObjGroup;
        }
      }
    }

    for (let i = 0; i < reorderedObjGroups.length; i++) {
      const objGroup = reorderedObjGroups[i];

      // add 'to' if indirect AND preceded by direct object (pronoun or complete form)
      if (objGroup.type === 'INDIRECT' && i >= 1 && reorderedObjGroups[i - 1].type === 'DIRECT') {
        this.valueManager.value('to', null);
        this.addSeparatingSpace();
      }

      if (this.refsManager.hasTriggeredRef(objGroup.obj)) {
        // pronoun
        const gender = this.genderNumberManager.getRefGender(objGroup.obj, null);
        const number = this.genderNumberManager.getRefNumber(objGroup.obj, null);
        const pronoun = this.getObjectPronoun(gender, number);

        this.valueManager.value(pronoun, null);
      } else {
        // complete form
        this.valueManager.value(objGroup.obj, null);
      }
      this.addSeparatingSpace();
    }
  }
}
