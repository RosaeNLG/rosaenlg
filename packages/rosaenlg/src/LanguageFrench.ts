/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


import { DetParams, DetTypes, LanguageImpl, AgreeAdjParams, GrammarParsed } from './LanguageImpl';
import { GenderNumberManager } from './GenderNumberManager';
import { RefsManager, NextRef } from './RefsManager';
import { Helper } from './Helper';
import { VerbsData } from 'rosaenlg-pug-code-gen';
import { Genders, Numbers, GendersMF } from './NlgLib';
import { getDet as getFrenchDet } from 'french-determiners';
import { agreeAdjective as agreeFrenchAdj } from 'french-adjectives-wrapper';
import frenchWordsGenderLefff from 'french-words-gender-lefff';
import { getGender as getGenderFrenchWord, GenderList as FrenchGenderList } from 'french-words';
import { getOrdinal as getFrenchOrdinal } from 'french-ordinals';
import 'numeral/locales/fr';
import { fr as dataFnsFr } from 'date-fns/locale';
import { getPlural as getFrenchPlural } from 'french-words';
import { parse as frenchParse } from '../dist/french-grammar.js';
import { LefffHelper } from 'lefff-helper';
import { getConjugation as libGetConjugationFr, FrenchAux, alwaysAuxEtre } from 'french-verbs';
import frenchVerbsDict from 'french-verbs-lefff';
import { ConjParams } from './VerbsManager';
import { LanguageCommon } from 'rosaenlg-commons';
import n2words from '../../rosaenlg-n2words/dist/n2words_FR.js';

interface ConjParamsFr extends ConjParams {
  tense: string;
  agree: any;
  aux: FrenchAux;
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

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    try {
      this.dictHelper = new LefffHelper();
    } catch (err) {
      // console.log('well, we are in browser');
    }
  }

  getDet(det: DetTypes, params: DetParams): string {
    return getFrenchDet(det, params.genderOwned as GendersMF, params.numberOwned || 'S', params.numberOwner || 'S');
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

  // should manager "1er", "1ère"?
  getOrdinal(val: number /*, _gender: Genders*/): string {
    return getFrenchOrdinal(val);
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

  thirdPossessionTriggerRef(owner: any, owned: any, params: any, spy: Spy): void {
    spy.getPugMixins().value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
    spy.appendPugHtml(` de `);
    spy.getPugMixins().value(owner, Object.assign({}, params));
  }

  thirdPossessionRefTriggered(
    owner: any,
    owned: any,
    params: any,
    spy: Spy,
    genderNumberManager: GenderNumberManager,
  ): void {
    const det: string = this.getDet('POSSESSIVE', {
      genderOwned: genderNumberManager.getRefGender(owned, null),
      genderOwner: null,
      numberOwner: genderNumberManager.getRefNumber(owner, params),
      numberOwned: genderNumberManager.getRefNumber(owned, params),
      case: null,
      dist: null,
      after: null,
    });

    spy.appendPugHtml(` ${det} ${owned} `);
  }

  recipientPossession(owned: any, spy: Spy, refsManager: RefsManager, helper: Helper): void {
    const nextRef: NextRef = refsManager.getNextRep(owned, { _OWNER: true });
    /* console.log(`nextRef: 
            gender=${genderNumberManager.getRefGender(nextRef, null)} 
            number=${genderNumberManager.getRefNumber(nextRef, null)}`);
    */

    // vos / votre + value of the object
    spy.appendPugHtml(`${helper.getSorP(['votre', 'vos'], nextRef)} `);
    spy.getPugMixins().value(owned, { _OWNER: true });
  }

  getConjugation(
    subject: any,
    verb: string,
    tense: string,
    number: Numbers,
    conjParams: ConjParamsFr,
    genderNumberManager: GenderNumberManager,
    embeddedVerbs: VerbsData,
  ): string {
    let person;
    if (number === 'P') {
      person = 5;
    } else {
      person = 2;
    }

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
      agreeGender = genderNumberManager.getRefGender(conjParams.agree, null) as GendersMF;
      agreeNumber = genderNumberManager.getRefNumber(conjParams.agree, null);
    } else if (tense === 'PASSE_COMPOSE' || tense === 'PLUS_QUE_PARFAIT') {
      // no explicit "agree" param, but aux is ETRE, either clearly stated or is default,
      // then agreement of the participle must be automatic
      if (aux === 'ETRE' || alwaysAuxEtre(verb)) {
        agreeGender = genderNumberManager.getRefGender(subject, null) as GendersMF;
        agreeNumber = genderNumberManager.getRefNumber(subject, null);
      }
    }

    // also
    //console.log(`verbsSpecificList: ${JSON.stringify(params.verbsSpecificList)}`);

    return libGetConjugationFr(
      embeddedVerbs || frenchVerbsDict, // give the verbs that we embedded in the compiled template, if there are some; if nothing we use the lefff
      verb,
      tense,
      person,
      aux,
      agreeGender,
      agreeNumber,
      pronominal,
    );
  }
}
