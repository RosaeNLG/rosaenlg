/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetParams, LanguageImpl, AgreeAdjParams, DetTypes, GrammarParsed } from './LanguageImpl';
import { GenderNumberManager } from './GenderNumberManager';
import { Genders, GendersMF, Numbers } from './NlgLib';
import { ConjParams } from './VerbsManager';
import { VerbsData } from 'rosaenlg-pug-code-gen';
import { getDet as getItalianDet, DetType as ItalianDetType, Dist as ItalianDist } from 'italian-determiners';
import { agreeItalianAdjective } from 'italian-adjectives';
import italianAdjectivesDict from 'italian-adjectives-dict';
import { getGenderItalianWord, getNumberItalianWord, WordsInfo as ItalianWordsInfo } from 'italian-words';
import italianWordsDict from 'italian-words-dict';
import { getOrdinal as getItalianOrdinal } from 'italian-ordinals-cardinals';
import 'numeral/locales/it';
import { it as dataFnsIt } from 'date-fns/locale';
import { parse as italianParse } from '../dist/italian-grammar.js';
import { MorphItHelper } from 'morph-it-helper';
import { getConjugation as libGetConjugationIt, ItalianAux } from 'italian-verbs';
import italianVerbsDict from 'italian-verbs-dict';
import { LanguageCommon } from 'rosaenlg-commons';
import n2words from '../../rosaenlg-n2words/dist/n2words_IT.js';

interface ConjParamsIt extends ConjParams {
  tense: string;
  agree: any;
  aux: ItalianAux;
}

export class LanguageItalian extends LanguageImpl {
  iso2 = 'it';
  langForNumeral = 'it';
  langForDateFns = dataFnsIt;
  n2wordsLang = 'it';
  n2wordsLib = n2words;
  floatingPointWord = 'punto';
  table0to9 = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove'];
  hasGender = true;
  hasNeutral = false;
  defaultAdjPos = 'AFTER'; // l'adjectif qualificatif se place généralement après le nom mais peut également le précéder
  eatSpaceWhenAdjEndsWithApostrophe = true;
  defaultTense = 'PRESENTE';
  defaultLastSeparatorForAdjectives = 'e';

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    try {
      this.dictHelper = new MorphItHelper();
    } catch (err) {
      // console.log('well, we are in browser');
    }
  }

  getDet(det: DetTypes, params: DetParams): string {
    // istanbul ignore next
    return getItalianDet(
      det as ItalianDetType,
      params.genderOwned as GendersMF,
      params.numberOwned || 'S',
      params.dist as ItalianDist,
    ); // || S will be tested when possessives added
  }

  getAgreeAdj(adjective: string, gender: Genders, number: Numbers, subject: any, params: AgreeAdjParams): string {
    return agreeItalianAdjective(
      this.getDictManager().getAdjsData(),
      italianAdjectivesDict,
      adjective,
      gender as GendersMF,
      number,
      subject,
      params && params.adjPos === 'BEFORE',
    );
  }

  getWordGender(word: string): Genders {
    return getGenderItalianWord(this.getDictManager().getWordData(), italianWordsDict, word); //NOSONAR
  }

  getOrdinal(val: number, gender: Genders): string {
    return getItalianOrdinal(val, gender as GendersMF);
  }

  getFormattedNominalGroup(possessiveAdj: string, adjBefore: string, substantive: string, adjAfter: string): string {
    if (adjBefore.endsWith("'")) {
      // bell'uomo
      return `${possessiveAdj} ${adjBefore}${substantive} ${adjAfter}`;
    } else {
      return `${possessiveAdj} ${adjBefore} ${substantive} ${adjAfter}`;
    }
  }

  getSubstantive(subst: string, number: Numbers): string {
    if (number === 'S') {
      return subst;
    } else {
      return getNumberItalianWord(
        this.getDictManager().getWordData(),
        italianWordsDict as ItalianWordsInfo,
        subst,
        number,
      ); //NOSONAR
    }
  }

  parseSimplifiedString(val: string): GrammarParsed {
    return italianParse(val, { dictHelper: this.dictHelper });
  }

  getConjugation(
    _subject: any,
    verb: string,
    tense: string,
    number: Numbers,
    conjParams: ConjParamsIt,
    genderNumberManager: GenderNumberManager,
    embeddedVerbs: VerbsData,
  ): string {
    let aux: ItalianAux;
    if (conjParams && conjParams.aux) {
      aux = conjParams.aux;
    }
    let agreeGender: GendersMF;
    let agreeNumber: Numbers;
    if (conjParams && conjParams.agree) {
      agreeGender = genderNumberManager.getRefGender(conjParams.agree, null) as GendersMF;
      agreeNumber = genderNumberManager.getRefNumber(conjParams.agree, null);
    }

    //console.log(`verbsSpecificList: ${JSON.stringify(params.verbsSpecificList)}`);

    return libGetConjugationIt(
      embeddedVerbs || italianVerbsDict, // give the verbs that we embedded in the compiled template, if there are some
      verb,
      tense,
      3,
      number,
      aux,
      agreeGender,
      agreeNumber,
    );
  }

  isPlural(val: number): boolean {
    // https://groups.google.com/g/it.scienza.matematica/c/UogaRZ4tSb8
    if (val === 1 || val === -1) {
      return false;
    } else {
      return true;
    }
  }
}
