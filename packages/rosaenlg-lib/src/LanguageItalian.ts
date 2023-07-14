/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetParams, LanguageImpl, AgreeAdjParams, SomeTense, DetTypes, GrammarParsed } from './LanguageImpl';
import { Genders, GendersMF, Numbers } from './NlgLib';
import { ConjParams } from './VerbsManager';
import { getDet as getItalianDet, DetType as ItalianDetType, Dist as ItalianDist } from 'italian-determiners';
import { agreeItalianAdjective } from 'italian-adjectives';
import italianAdjectivesDict from 'italian-adjectives-dict/dist/adjectives.json';
import { getGenderItalianWord, getNumberItalianWord } from 'italian-words';
import { WordsInfo as ItalianWordsInfo } from 'italian-words-dict';
import italianWordsDict from 'italian-words-dict/dist/words.json';
import { getOrdinal as getItalianOrdinal } from 'italian-ordinals-cardinals';
import 'numeral/locales/it';
import { it as dataFnsIt } from 'date-fns/locale';
import { parse as italianParse } from '../dist/italian-grammar.js';
import { MorphItHelper } from 'morph-it-helper';
import { getConjugation as libGetConjugationIt, ItalianAux, ItalianTense } from 'italian-verbs';
import italianVerbsDict from 'italian-verbs-dict/dist/verbs.json';
import { LanguageCommon, VerbsInfo } from 'rosaenlg-commons';
import n2words from '../../rosaenlg-n2words/dist/n2words_IT.js';
import { PersonForSentence } from './SentenceManager';
import { GenderNumberManager } from './GenderNumberManager';

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
  universalMapping = {
    UNIVERSAL_PRESENT: 'PRESENTE',
    UNIVERSAL_PAST: 'IMPERFETTO',
    UNIVERSAL_FUTURE: 'FUTURO_SEMPLICE',
    UNIVERSAL_PERFECT: 'PASSATO_PROSSIMO',
    UNIVERSAL_PLUPERFECT: 'TRAPASSATO_PROSSIMO',
  };
  spacesWhenSeparatingElements = true;

  constructor(languageCommon: LanguageCommon) {
    super(languageCommon);
    try {
      this.dictHelper = new MorphItHelper();
    } catch (err) {
      // this means that we are in a browser
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
    return getGenderItalianWord(this.getDictManager().getWordData(), italianWordsDict as ItalianWordsInfo, word); //NOSONAR
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
    originalTense: SomeTense,
    person: PersonForSentence,
    conjParams: ConjParamsIt,
    embeddedVerbs: VerbsInfo,
  ): string {
    const solvedTense = this.solveTense(originalTense);

    let aux: ItalianAux | undefined = undefined;
    if (conjParams && conjParams.aux) {
      aux = conjParams.aux;
    }
    let agreeGender: GendersMF | undefined = undefined;
    let agreeNumber: Numbers | undefined = undefined;
    if (conjParams && conjParams.agree) {
      agreeGender = (this.genderNumberManager as GenderNumberManager).getRefGender(conjParams.agree, null) as GendersMF;
      agreeNumber = (this.genderNumberManager as GenderNumberManager).getRefNumber(conjParams.agree, null) as Numbers;
    }

    return libGetConjugationIt(
      (embeddedVerbs as VerbsInfo) || (italianVerbsDict as VerbsInfo), // give the verbs that we embedded in the compiled template, if there are some
      verb,
      solvedTense as ItalianTense,
      this.mapPersonToNumber1to3(person),
      this.mapPersonToSP(person),
      { aux: aux, agreeGender: agreeGender, agreeNumber: agreeNumber },
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
