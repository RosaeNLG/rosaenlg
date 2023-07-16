/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { enUS as dataFnsEnUs } from 'date-fns/locale';
import { Dist as EnglishDist, getDet as getEnglishDet } from 'english-determiners';
import { getOrdinal as getEnglishOrdinal } from 'english-ordinals';
import { getPlural } from 'english-plurals';
import englishPluralsList from 'english-plurals-list/dist/plurals.json';
import englishVerbsGerunds from 'english-verbs-gerunds/dist/gerunds.json';
import {
  ExtraParams as ExtraParamsEn,
  Tense,
  getConjugation as libGetConjugationEn,
  mergeVerbsData as mergeVerbsDataEn,
} from 'english-verbs-helper';
import englishVerbsIrregular from 'english-verbs-irregular/dist/verbs.json';
import { LanguageCommon, VerbsInfo } from 'rosaenlg-commons';
import n2words from '../../rosaenlg-n2words/dist/n2words_EN.js';
import { parse as englishParse } from '../dist/english-grammar.js';
import { DetParams, DetTypes, GrammarParsed, LanguageImpl, SomeTense } from './LanguageImpl';
import { Genders, Numbers } from './NlgLib';
import { PersonForSentence, SentenceParams, VerbalGroup } from './SentenceManager';
import { ValueManager, ValueParams } from './ValueManager';
import { ConjParams, VerbsManager } from './VerbsManager';
import { Helper } from './Helper.js';
import { GenderNumberManager } from './GenderNumberManager.js';
import { RefsManager } from './RefsManager.js';

interface SentenceParamsEn extends SentenceParams {
  contractNegation?: boolean;
  negationNoDo?: boolean;
}

interface ConjParamsEn extends ConjParams, ExtraParamsEn {
  tense: string;
}

export type PossForm = 'OF' | 'S';

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
    return getEnglishOrdinal(val) as string; // throws Exception if is not able to generate an ordinal
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
        (this.valueManager as ValueManager).value(
          owned,
          (Object.assign({}, params, { det: 'DEFINITE' }) as unknown) as ValueParams,
        );
        this.getSpy().appendPugHtml(` of `);
        (this.valueManager as ValueManager).value(owner, (Object.assign({}, params) as unknown) as ValueParams);
        break;
      }
      case 'S': {
        (this.valueManager as ValueManager).value(owner, (Object.assign({}, params) as unknown) as ValueParams);
        this.getSpy().appendPugHtml(`'s`);
        (this.helper as Helper).insertSeparatingSpaceIfRequired();
        (this.valueManager as ValueManager).value(owned, (Object.assign({}, params) as unknown) as ValueParams);
        break;
      }
    }
  }

  thirdPossessionRefTriggered(owner: any, owned: any, params: any): void {
    const det: string = this.getDet('POSSESSIVE', {
      genderOwned: undefined,
      genderOwner: (this.genderNumberManager as GenderNumberManager).getRefGender(owner, params),
      numberOwner: (this.genderNumberManager as GenderNumberManager).getRefNumber(owner, params),
      numberOwned: undefined, // we do not care
      case: undefined,
      dist: undefined,
      after: undefined,
      useTheWhenPlural: undefined,
    });

    this.getSpy().appendPugHtml(` ${det} ${owned} `);
  }

  recipientPossession(owned: any): void {
    this.getSpy().appendPugHtml('your');
    (this.valueManager as ValueManager).value(owned, ({ _OWNER: true } as unknown) as ValueParams);
  }

  getConjugation(
    _subject: any,
    verb: string,
    tense: SomeTense,
    person: PersonForSentence,
    conjParams: ConjParamsEn,
    embeddedVerbs: VerbsInfo,
  ): string {
    return libGetConjugationEn(
      embeddedVerbs || this.mergedVerbsDataEn,
      verb,
      this.solveTense(tense) as Tense,
      this.mapPersonToNumber0to5(person),
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

  getObjectPronoun(gender: Genders | undefined, number: Numbers | undefined): string {
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

  getPersonalPronounSubject(person: PersonForSentence): string {
    /* istanbul ignore next */
    if (person === '3S') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `personal pronoun subject unknown: could be he / she / it`;
      throw err;
    }

    return {
      '1S': 'I',
      '2S': 'you',
      '1P': 'we',
      '2P': 'you',
      '3P': 'they',
    }[person] as string;
  }

  sentence(sentenceParams: SentenceParamsEn): void {
    if (sentenceParams.subjectGroup.person === '3S' && !sentenceParams.subjectGroup.subject) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `in sentence, when using 3S person, subject object is required`;
      throw err;
    }

    if (sentenceParams && sentenceParams.hasOwnProperty('modifierAdverb')) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `in sentence, modifierAdverb is not supported in English`;
      throw err;
    }

    const subjectGroup = sentenceParams.subjectGroup;
    const subject = subjectGroup.subject;

    const verbalGroup: VerbalGroup | undefined = sentenceParams.verbalGroup;

    const hasVerb = verbalGroup && verbalGroup.verb;

    const objGroups = sentenceParams.objGroups != null ? sentenceParams.objGroups : [];

    // subject
    if (subjectGroup.noSubject !== true) {
      if (
        subjectGroup.person === '1S' ||
        subjectGroup.person === '2S' ||
        subjectGroup.person === '1P' ||
        subjectGroup.person === '2P' ||
        (subjectGroup.person === '3P' && !subjectGroup.subject)
      ) {
        // use pronoun
        (this.valueManager as ValueManager).value(this.getPersonalPronounSubject(subjectGroup.person), undefined);
      } else {
        (this.valueManager as ValueManager).value(subjectGroup.subject, undefined);
      }
      this.addSeparatingSpace();
    }
    // verb
    if (hasVerb) {
      const modifiedVerbalGroup = { ...verbalGroup } as ConjParamsEn;
      if (sentenceParams.negative) {
        modifiedVerbalGroup.NEGATIVE = true;
        modifiedVerbalGroup.CONTRACT = sentenceParams.contractNegation;
        modifiedVerbalGroup.NO_DO = sentenceParams.negationNoDo;
      }
      (this.valueManager as ValueManager).value(
        (this.verbsManager as VerbsManager).getAgreeVerb(subject, subjectGroup.person, modifiedVerbalGroup, null),
        undefined,
      );
      this.addSeparatingSpace();
    }

    const reorderedObjGroups = [...objGroups];

    /*
      if an indirect object in normal form is followed by a direct object in pronoun form: we do invert
      e.g. 'he gave the neighbor apples' => 'he gave them to the neighbor' (or not 'he gave the neighbor them')
    */
    for (let i = 0; i < reorderedObjGroups.length; i++) {
      const objGroup = reorderedObjGroups[i];
      if (i >= 1 && objGroup.type === 'DIRECT' && (this.refsManager as RefsManager).hasTriggeredRef(objGroup.obj)) {
        const precObjGroup = reorderedObjGroups[i - 1];
        if (precObjGroup.type === 'INDIRECT' && !(this.refsManager as RefsManager).hasTriggeredRef(precObjGroup.obj)) {
          reorderedObjGroups[i - 1] = objGroup;
          reorderedObjGroups[i] = precObjGroup;
        }
      }
    }

    for (let i = 0; i < reorderedObjGroups.length; i++) {
      const objGroup = reorderedObjGroups[i];

      // add 'to' if indirect AND preceded by direct object (pronoun or complete form)
      if (objGroup.type === 'INDIRECT' && i >= 1 && reorderedObjGroups[i - 1].type === 'DIRECT') {
        (this.valueManager as ValueManager).value('to', undefined);
        this.addSeparatingSpace();
      }

      if ((this.refsManager as RefsManager).hasTriggeredRef(objGroup.obj)) {
        // pronoun
        const gender = (this.genderNumberManager as GenderNumberManager).getRefGender(objGroup.obj, null);
        const number = (this.genderNumberManager as GenderNumberManager).getRefNumber(objGroup.obj, null);
        const pronoun = this.getObjectPronoun(gender, number);

        (this.valueManager as ValueManager).value(pronoun, undefined);
      } else {
        // complete form
        (this.valueManager as ValueManager).value(objGroup.obj, undefined);
      }
      this.addSeparatingSpace();
    }
  }
}
