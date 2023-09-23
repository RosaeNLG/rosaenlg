/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { fr as dataFnsFr } from 'date-fns/locale';
import { agreeAdjective as agreeFrenchAdj } from 'french-adjectives-wrapper';
import { getDet as getFrenchDet } from 'french-determiners';
import { getOrdinal as getFrenchOrdinal } from 'french-ordinals';
import {
  alwaysAuxEtre,
  getAux,
  FrenchAux,
  isComposedTense,
  getConjugation as libGetConjugationFr,
  Voice,
  Tense,
} from 'french-verbs';
import frenchVerbsDict from 'french-verbs-lefff/dist/conjugations.json';
import { getPlural as getFrenchPlural, getGender as getGenderFrenchWord } from 'french-words';
import frenchWordsGenderLefff from 'french-words-gender-lefff/dist/words.json';
import { GenderList as FrenchGenderList } from 'french-words-gender-lefff';
import { LefffHelper } from 'lefff-helper';
import 'numeral/locales/fr';
import n2words from '../../rosaenlg-n2words/dist/n2words_FR.js';
import { parse as frenchParse } from '../dist/french-grammar.js';
import { GenderNumberManager } from './GenderNumberManager.js';
import { Helper } from './Helper.js';
import { AgreeAdjParams, DetParams, DetTypes, GrammarParsed, LanguageImpl, SomeTense } from './LanguageImpl';
import { Genders, GendersMF, Numbers } from './NlgLib';
import { NextRef, RefsManager } from './RefsManager';
import { PersonForSentence, SentenceParams, VerbalGroup } from './SentenceManager';
import { ValueManager, ValueParams } from './ValueManager';
import { ConjParams, VerbsManager } from './VerbsManager';
import { LanguageCommon, VerbsInfo } from 'rosaenlg-commons';

interface SentenceParamsFr extends SentenceParams {
  negativeAdverb?: string;
  modifierAdverb?: string; // adverbe that will be added between the aux and the verb in composed tenses, or just after the verb in non-composed tense
}

// TODO A REVOIR doublon / verbal group
interface ConjParamsFr extends ConjParams {
  tense: string;
  agree: any;
  aux: FrenchAux;
  negativeAdverb: string | undefined;
  modifierAdverb: string | undefined;
  voice: Voice;
}

interface VerbalGroupFrench extends VerbalGroup {
  agree?: any;
  aux?: FrenchAux;
  negativeAdverb?: string;
  modifierAdverb?: string;
  voice?: Voice;
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
      contentAfterDet: after ? after.replace(/¤/g, ' ').trim() : undefined,
      forceDes,
    }) as string; // we hope it is a string
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

  getTextualNumber(val: number, gender: Genders | undefined): string {
    if (val === 1) {
      return gender === 'F' ? 'une' : 'un';
    } else {
      return super.getTextualNumber(val, gender);
    }
  }

  getOrdinalNumber(val: number, gender: Genders | undefined): string {
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
    (this.valueManager as ValueManager).value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
    this.getSpy().appendPugHtml(` de `);
    (this.valueManager as ValueManager).value(owner, Object.assign({}, params));
  }

  thirdPossessionRefTriggered(owner: any, owned: any, params: ValueParams): void {
    const det: string = this.getDet('POSSESSIVE', {
      genderOwned: (this.genderNumberManager as GenderNumberManager).getRefGender(owned, null),
      genderOwner: undefined,
      numberOwner: (this.genderNumberManager as GenderNumberManager).getRefNumber(owner, params),
      numberOwned: (this.genderNumberManager as GenderNumberManager).getRefNumber(owned, params),
      personOwner: (params && params.personOwner) || null,
      case: null,
      dist: null,
      after: undefined,
      useTheWhenPlural: undefined,
    });

    (this.helper as Helper).insertSeparatingSpaceIfRequired();
    this.getSpy().appendPugHtml(det);
    (this.helper as Helper).insertSeparatingSpaceIfRequired();
    (this.valueManager as ValueManager).value(owned, Object.assign({}, params, { det: '' }));
  }

  recipientPossession(owned: any): void {
    const nextRef: NextRef = (this.refsManager as RefsManager).getNextRep(owned, { _OWNER: true });
    // vos / votre + value of the object
    this.getSpy().appendPugHtml((this.helper as Helper).getSorP(['votre', 'vos'], nextRef) + ' ');
    (this.valueManager as ValueManager).value(owned, ({ _OWNER: true } as unknown) as ValueParams);
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

    let pronominal = false;
    if (conjParams && conjParams.pronominal) {
      pronominal = true;
    }
    let aux: FrenchAux | undefined = undefined;
    if (conjParams && conjParams.aux) {
      aux = conjParams.aux;
    }
    let voice: Voice = 'Act';
    if (conjParams && conjParams.voice) {
      voice = conjParams.voice;
    }
    let agreeGender: GendersMF | undefined = undefined;
    let agreeNumber: Numbers | undefined = undefined;
    if (conjParams && conjParams.agree) {
      agreeGender = (this.genderNumberManager as GenderNumberManager).getRefGender(conjParams.agree, null) as GendersMF;
      agreeNumber = (this.genderNumberManager as GenderNumberManager).getRefNumber(conjParams.agree, null);
    } else if (isComposedTense(solvedTense as Tense) || voice === 'Pass') {
      // no explicit "agree" param, but aux is ETRE, either clearly stated or is default,
      // then agreement of the participle must be automatic
      if (aux === 'ETRE' || alwaysAuxEtre(verb) || voice === 'Pass') {
        agreeGender = (this.genderNumberManager as GenderNumberManager).getRefGender(subject, null) as GendersMF;
        agreeNumber = (this.genderNumberManager as GenderNumberManager).getRefNumber(subject, null);
      }
    }

    return libGetConjugationFr(
      (embeddedVerbs as VerbsInfo) || (frenchVerbsDict as VerbsInfo), // give the verbs that we embedded in the compiled template, if there are some; if nothing we use the lefff
      verb,
      solvedTense as Tense,
      this.mapPersonToNumber0to5(person),
      {
        aux: aux,
        agreeGender: agreeGender,
        agreeNumber: agreeNumber,
      },
      pronominal,
      conjParams.negativeAdverb,
      conjParams.modifierAdverb,
      voice,
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

  getDirectObjPronoun(gender: Genders | undefined, number: Numbers | undefined, person?: PersonForSentence): string {
    if (!person || person === '3S' || person === '3P') {
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
    return {
      '1S': 'me',
      '2S': 'te',
      '1P': 'nous',
      '2P': 'vous',
    }[person] as string;
  }

  getIndirectObjPronoun(gender: Genders | undefined, number: Numbers | undefined, person?: PersonForSentence): string {
    if (!person || person === '3S' || person === '3P') {
      if (number === 'P') {
        return 'leur';
      } else {
        return 'lui';
      }
    }
    return {
      '1S': 'me',
      '2S': 'te',
      '1P': 'nous',
      '2P': 'vous',
    }[person] as string;
  }

  sentence(sentenceParams: SentenceParamsFr): void {
    const subject = sentenceParams.subjectGroup.subject;
    const verbalGroup: VerbalGroupFrench | undefined = sentenceParams.verbalGroup;
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
        (this.valueManager as ValueManager).value(this.getPersonalPronounSubject(subjectGroup.person), undefined);
      } else {
        (this.valueManager as ValueManager).value(subjectGroup.subject, subjectGroup.params);
      }
      this.addSeparatingSpace();
    }

    // 'ne' always comes after the subject, whatever pronouns we have
    if (sentenceParams.negative) {
      (this.valueManager as ValueManager).value('ne', undefined);
      this.addSeparatingSpace();
    }

    // for pronouns, order is static: COD then COI
    const triggeredList = objGroups
      .filter((objGroup) => objGroup.params?.REPRESENTANT !== 'ref')
      .filter(
        (objGroup) =>
          objGroup.params?.REPRESENTANT === 'refexpr' ||
          (this.refsManager && this.refsManager.hasTriggeredRef(objGroup.obj)),
      )
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
      if (triggered.pronounForm) {
        (this.valueManager as ValueManager).value(triggered.pronounForm, undefined);
      } else {
        const gender = (this.genderNumberManager as GenderNumberManager).getRefGender(triggered.obj, null);
        const number = (this.genderNumberManager as GenderNumberManager).getRefNumber(triggered.obj, null);
        let pronoun: string;
        if (triggered.type === 'DIRECT') {
          triggeredDirectObj = triggered.obj; // to agree the verb
          pronoun = this.getDirectObjPronoun(gender, number, triggered.params?.person);
        } else {
          // INDIRECT
          pronoun = this.getIndirectObjPronoun(gender, number, triggered.params?.person);
        }
        (this.valueManager as ValueManager).value(pronoun, undefined);
      }
      this.addSeparatingSpace();
    }

    // verb
    if (hasVerb) {
      const modifiedVerbalGroup = { ...verbalGroup };
      // if there is a diretObj, voice has to be active
      if (
        isComposedTense(verbalGroup.tense as Tense) &&
        getAux(verbalGroup.verb, (verbalGroup as VerbalGroupFrench).aux as FrenchAux, undefined) &&
        triggeredDirectObj !== null
      ) {
        modifiedVerbalGroup.agree = triggeredDirectObj;
      }

      if (sentenceParams.negative) {
        // The use of ?? (and not ||) in the folowwing asserton allow to pass an empty string as negativeAdverb
        modifiedVerbalGroup.negativeAdverb = sentenceParams.negativeAdverb ?? 'pas';
      }

      modifiedVerbalGroup.modifierAdverb = sentenceParams.modifierAdverb;

      (this.valueManager as ValueManager).value(
        (this.verbsManager as VerbsManager).getAgreeVerb(subject, subjectGroup.person, modifiedVerbalGroup, null),
        undefined,
      );
      this.addSeparatingSpace();
    }

    // the order must be respected
    const notTriggeredList = objGroups.filter((objGroup) => triggeredList.indexOf(objGroup) === -1);
    for (const objGroup of notTriggeredList) {
      if (objGroup.type === 'DIRECT') {
        (this.valueManager as ValueManager).value(objGroup.obj, objGroup.params);
      } else {
        // INDIRECT
        if (objGroup.preposition) {
          (this.valueManager as ValueManager).value(objGroup.preposition, undefined);
        }
        (this.valueManager as ValueManager).value(objGroup.obj, objGroup.params);
      }
      this.addSeparatingSpace();
    }
  }
}
