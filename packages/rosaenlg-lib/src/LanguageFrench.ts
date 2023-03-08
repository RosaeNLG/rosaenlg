/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetParams, DetTypes, LanguageImpl, SomeTense, AgreeAdjParams, GrammarParsed } from './LanguageImpl';
import { ValueParams } from './ValueManager';
import { Genders, Numbers, GendersMF } from './NlgLib';
import { getDet as getFrenchDet } from 'french-determiners';
import { agreeAdjective as agreeFrenchAdj } from 'french-adjectives-wrapper';
import frenchWordsGenderLefff from 'french-words-gender-lefff/dist/words.json';
import { GenderList as FrenchGenderList } from 'french-words-gender-lefff';
import { getGender as getGenderFrenchWord, getPlural as getFrenchPlural } from 'french-words';
import { getOrdinal as getFrenchOrdinal } from 'french-ordinals';
import 'numeral/locales/fr';
import { fr as dataFnsFr } from 'date-fns/locale';
import { parse as frenchParse } from '../dist/french-grammar.js';
import { LefffHelper } from 'lefff-helper';
import { getConjugation as libGetConjugationFr, FrenchAux, alwaysAuxEtre, getAux } from 'french-verbs';
import frenchVerbsDict from 'french-verbs-lefff/dist/conjugations.json';
import { ConjParams } from './VerbsManager';
import { LanguageCommon, VerbsInfo } from 'rosaenlg-commons';
import n2words from '../../rosaenlg-n2words/dist/n2words_FR.js';
import { PersonForSentence, SentenceParams, VerbalGroup } from './SentenceManager';
import { NextRef } from './RefsManager';

interface SentenceParamsFr extends SentenceParams {
  negativeAdverb?: string;
}

// TODO A REVOIR doublon / verbal group
interface ConjParamsFr extends ConjParams {
  tense: string;
  agree: any;
  aux: FrenchAux;
  negativeAdverb?: string;
}

interface VerbalGroupFrench extends VerbalGroup {
  agree?: any;
  aux?: FrenchAux;
  negativeAdverb?: string;
}

export class LanguageFrench extends LanguageImpl {
  iso2 = 'fr';
  langForNumeral = 'fr';
  langForDateFns = dataFnsFr;
  n2wordsLang = 'fr';
  n2wordsLib = n2words;
  floatingPointWord = 'virgule';
  table0to9 = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  hasGender = true;
  hasNeutral = false;
  defaultAdjPos = 'AFTER'; // In general, and unlike English, French adjectives are placed after the noun they describe
  defaultTense = 'PRESENT';
  defaultLastSeparatorForAdjectives = 'et';
  universalMapping = {
    UNIVERSAL_PRESENT: 'PRESENT',
    UNIVERSAL_PAST: 'IMPARFAIT',
    UNIVERSAL_FUTURE: 'FUTUR',
    UNIVERSAL_PERFECT: 'PASSE_COMPOSE',
    UNIVERSAL_PLUPERFECT: 'PLUS_QUE_PARFAIT',
  };
  spacesWhenSeparatingElements = true;

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    try {
      this.dictHelper = new LefffHelper();
    } catch (err) {
      // this means that we are in a browser
    }
  }

  getDet(detType: DetTypes, params: DetParams): string {
    const { genderOwned, numberOwned, numberOwner, adjectiveAfterDet, after, forceDes, personOwner } = params;
    return getFrenchDet({
      detType,
      genderOwned: genderOwned as GendersMF,
      numberOwned: numberOwned || 'S',
      numberOwner: numberOwner || 'S',
      personOwner: personOwner || 3,
      adjectiveAfterDet,
      contentAfterDet: after,
      forceDes,
    });
  }

  getAgreeAdj(adjective: string, gender: Genders, number: Numbers, subject: any, params: AgreeAdjParams): string {
    return agreeFrenchAdj(
      this.getDictManager().getAdjsData(),
      adjective,
      gender as GendersMF,
      number,
      subject,
      params && params.adjPos === 'BEFORE',
      this.getDictManager().getWordData(),
    );
  }

  getWordGender(word: string): GendersMF {
    return getGenderFrenchWord(this.getDictManager().getWordData(), frenchWordsGenderLefff as FrenchGenderList, word); //NOSONAR
  }

  getOrdinal(val: number, gender: Genders): string {
    return getFrenchOrdinal(val, gender as GendersMF);
  }

  getTextualNumber(val: number, gender: Genders): string {
    if (val === 1) {
      return gender === 'F' ? 'une' : 'un';
    } else {
      return super.getTextualNumber(val, gender);
    }
  }

  getOrdinalNumber(val: number, gender: Genders): string {
    if (val == 1) {
      if (gender == 'F') {
        return '1re'; // première
      } else {
        return '1er';
      }
    } else {
      // default implementation works fine for the rest
      return super.getOrdinalNumber(val, gender);
    }
  }

  getSubstantive(subst: string, number: Numbers): string {
    if (number === 'S') {
      return subst;
    } else {
      return getFrenchPlural(this.getDictManager().getWordData(), subst);
    }
  }

  parseSimplifiedString(val: string): GrammarParsed {
    return frenchParse(val, { dictHelper: this.dictHelper });
  }

  thirdPossessionTriggerRef(owner: any, owned: any, params: ValueParams): void {
    this.valueManager.value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
    this.spy.appendPugHtml(` de `);
    this.valueManager.value(owner, Object.assign({}, params));
  }

  thirdPossessionRefTriggered(owner: any, owned: any, params: ValueParams): void {
    const det: string = this.getDet('POSSESSIVE', {
      genderOwned: this.genderNumberManager.getRefGender(owned, null),
      genderOwner: null,
      numberOwner: this.genderNumberManager.getRefNumber(owner, params),
      numberOwned: this.genderNumberManager.getRefNumber(owned, params),
      personOwner: (params && params.personOwner) || null,
      case: null,
      dist: null,
      after: null,
    });

    this.helper.insertSeparatingSpaceIfRequired();
    this.spy.appendPugHtml(det);
    this.helper.insertSeparatingSpaceIfRequired();
    this.valueManager.value(owned, Object.assign({}, params, { det: '' }));
  }

  recipientPossession(owned: any): void {
    const nextRef: NextRef = this.refsManager.getNextRep(owned, { _OWNER: true });
    // vos / votre + value of the object
    this.spy.appendPugHtml(this.helper.getSorP(['votre', 'vos'], nextRef) + ' ');
    this.valueManager.value(owned, ({ _OWNER: true } as unknown) as ValueParams);
  }

  getConjugation(
    subject: any,
    verb: SomeTense,
    originalTense: string,
    person: PersonForSentence,
    conjParams: ConjParamsFr,
    embeddedVerbs: VerbsInfo,
  ): string {
    const solvedTense = this.solveTense(originalTense);

    let pronominal: boolean;
    if (conjParams && conjParams.pronominal) {
      pronominal = true;
    }
    let aux: FrenchAux;
    if (conjParams && conjParams.aux) {
      aux = conjParams.aux;
    }
    let agreeGender: GendersMF;
    let agreeNumber: Numbers;
    if (conjParams && conjParams.agree) {
      agreeGender = this.genderNumberManager.getRefGender(conjParams.agree, null) as GendersMF;
      agreeNumber = this.genderNumberManager.getRefNumber(conjParams.agree, null);
    } else if (solvedTense === 'PASSE_COMPOSE' || solvedTense === 'PLUS_QUE_PARFAIT') {
      // no explicit "agree" param, but aux is ETRE, either clearly stated or is default,
      // then agreement of the participle must be automatic
      if (aux === 'ETRE' || alwaysAuxEtre(verb)) {
        agreeGender = this.genderNumberManager.getRefGender(subject, null) as GendersMF;
        agreeNumber = this.genderNumberManager.getRefNumber(subject, null);
      }
    }

    return libGetConjugationFr(
      (embeddedVerbs as VerbsInfo) || (frenchVerbsDict as VerbsInfo), // give the verbs that we embedded in the compiled template, if there are some; if nothing we use the lefff
      verb,
      solvedTense,
      this.mapPersonToNumber0to5(person),
      {
        aux: aux,
        agreeGender: agreeGender,
        agreeNumber: agreeNumber,
      },
      pronominal,
      conjParams.negativeAdverb,
    );
  }

  isPlural(val: number): boolean {
    /*
      En français, seules les quantités égales ou supérieures à 2 prennent la marque du pluriel.
      Singulier -2 < N < 2
      Pluriel |N| ≥ 2 (N ≤ -2 ou N ≥ 2)
    */
    if (val >= 2 || val <= -2) {
      return true;
    } else {
      return false;
    }
  }

  getPersonalPronounSubject(person: PersonForSentence): string {
    /* istanbul ignore next */
    if (person === '3S' || person === '3P') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `personal pronoun subject unknown: il / elle, ils / elles, etc.`;
      throw err;
    }
    return {
      '1S': 'je',
      '2S': 'tu',
      '1P': 'nous',
      '2P': 'vous',
    }[person] as string;
  }

  getDirectObjPronoun(gender: Genders, number: Numbers): string {
    if (number === 'P') {
      return 'les';
    } else {
      if (gender === 'M') {
        return 'le';
      } else {
        return 'la';
      }
    }
  }

  getIndirectObjPronoun(gender: Genders, number: Numbers): string {
    if (number === 'P') {
      return 'leur';
    } else {
      return 'lui';
    }
  }

  sentence(sentenceParams: SentenceParamsFr): void {
    const subject = sentenceParams.subjectGroup.subject;
    const verbalGroup: VerbalGroupFrench = sentenceParams.verbalGroup;
    const subjectGroup = sentenceParams.subjectGroup;

    const hasVerb = verbalGroup && verbalGroup.verb;

    const objGroups = sentenceParams.objGroups != null ? sentenceParams.objGroups : [];

    // subject
    if (subjectGroup.noSubject !== true) {
      if (
        subjectGroup.person === '1S' ||
        subjectGroup.person === '2S' ||
        subjectGroup.person === '1P' ||
        subjectGroup.person === '2P'
      ) {
        // use pronoun
        this.valueManager.value(this.getPersonalPronounSubject(subjectGroup.person), null);
      } else {
        this.valueManager.value(subjectGroup.subject, subjectGroup.params);
      }
      this.addSeparatingSpace();
    }

    // 'ne' always comes after the subject, whatever pronouns we have
    if (sentenceParams.negative) {
      this.valueManager.value('ne', null);
      this.addSeparatingSpace();
    }

    // for pronouns, order is static: COD then COI
    const triggeredList = objGroups
      .filter((objGroup) => this.refsManager.hasTriggeredRef(objGroup.obj))
      .sort((objGroup1, objGroup2) => {
        // istanbul ignore next
        if (objGroup1.type === objGroup2.type) {
          return 0;
        }
        if (objGroup1.type === 'DIRECT' && objGroup2.type === 'INDIRECT') {
          return -1;
        }
        return 1;
      });

    let triggeredDirectObj: any = null;
    for (const triggered of triggeredList) {
      const gender = this.genderNumberManager.getRefGender(triggered.obj, null);
      const number = this.genderNumberManager.getRefNumber(triggered.obj, null);
      let pronoun: string;
      if (triggered.type === 'DIRECT') {
        triggeredDirectObj = triggered.obj; // to agree the verb
        pronoun = this.getDirectObjPronoun(gender, number);
      } else {
        // INDIRECT
        pronoun = this.getIndirectObjPronoun(gender, number);
      }
      this.valueManager.value(pronoun, null);
      this.addSeparatingSpace();
    }

    // verb
    if (hasVerb) {
      const modifiedVerbalGroup = { ...verbalGroup };
      if (
        (verbalGroup.tense === 'PASSE_COMPOSE' || verbalGroup.tense === 'PLUS_QUE_PARFAIT') &&
        getAux(verbalGroup.verb, verbalGroup.aux, null) &&
        triggeredDirectObj !== null
      ) {
        modifiedVerbalGroup.agree = triggeredDirectObj;
      }

      if (sentenceParams.negative) {
        modifiedVerbalGroup.negativeAdverb = sentenceParams.negativeAdverb || 'pas';
      }

      this.valueManager.value(
        this.verbsManager.getAgreeVerb(subject, subjectGroup.person, modifiedVerbalGroup, null),
        null,
      );
      this.addSeparatingSpace();
    }

    // the order must be respected
    const notTriggeredList = objGroups.filter((objGroup) => triggeredList.indexOf(objGroup) === -1);
    for (const objGroup of notTriggeredList) {
      if (objGroup.type === 'DIRECT') {
        this.valueManager.value(objGroup.obj, objGroup.params);
      } else {
        // INDIRECT
        if (objGroup.preposition !== null) {
          this.valueManager.value(objGroup.preposition, null);
        }
        this.valueManager.value(objGroup.obj, objGroup.params);
      }
      this.addSeparatingSpace();
    }
  }
}
