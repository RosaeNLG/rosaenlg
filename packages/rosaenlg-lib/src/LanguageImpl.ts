/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Genders, Numbers, Persons } from './NlgLib';
import { GenderNumberManager, WithGender, WithNumber } from './GenderNumberManager';
import { RefsManager } from './RefsManager';
import { Helper } from './Helper';
import { AdjPos, ValueManager } from './ValueManager';
import { ConjParams, VerbParts, VerbsManager } from './VerbsManager';
import { PersonForSentence, SentenceParams } from './SentenceManager';
import { SpyI } from './Spy';
import numeral from 'numeral';
import { Locale as dateFnsLocale, format as dateFnsFormat } from 'date-fns';
import { LanguageCommon, DictManager, VerbsInfo } from 'rosaenlg-commons';
export type DetTypes = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';
export { Numbers } from './NlgLib';

export interface DetParams {
  genderOwned: Genders | undefined;
  numberOwned: Numbers | undefined;
  genderOwner: Genders | undefined;
  numberOwner?: Numbers | null;
  personOwner?: Persons | null; // French implemented only
  case?: string | null; // German only / GermanCases
  dist?: string | null; // English and Spanish / EnglishDist | SpanishDist
  after: string | undefined; // Spanish and French
  useTheWhenPlural: boolean | undefined; // English only
  adjectiveAfterDet?: boolean | null; // French only de/des
  forceDes?: boolean | null; // French only de/des
}

export interface AgreeAdjParams extends WithGender, WithNumber {
  adjPos?: AdjPos;
  case?: string; // German only / GermanCases
  det?: DetTypes;
}

export interface GrammarParsed {
  // exist elsewhere, e.g. ValueParams
  gender: Genders;
  number: Numbers;
  adj: string;
  det: DetTypes;
  adjPos: AdjPos;
  // specific ones
  noun: string;
  unknownNoun: boolean;
}

export type SomeTense = string | UniversalTense;

type UniversalTense =
  | 'UNIVERSAL_PRESENT'
  | 'UNIVERSAL_PERFECT'
  | 'UNIVERSAL_PLUPERFECT'
  | 'UNIVERSAL_FUTURE'
  | 'UNIVERSAL_PAST';

export abstract class LanguageImpl {
  iso2: string | null = null;
  readonly langForNumeral: string | null = null; // when using numeral
  readonly langForDateFns: dateFnsLocale | undefined = undefined; // when using date-fns
  readonly defaultDateFormat = 'yyyy-MM-dd';
  readonly n2wordsLang: string | null = null; // when using n2words
  readonly n2wordsLib: ((_: number, options: any) => string) | null = null; // when using n2words
  readonly floatingPointWord: string | null = null; // when using n2words
  readonly table0to9: string[] | null = null;
  readonly hasGender: boolean | null = null;
  readonly hasNeutral: boolean | null = null;
  readonly defaultAdjPos: string | null = null; // 'BEFORE' or 'AFTER'
  readonly hasCase: boolean | null = null;
  readonly defaultCase: string | null = null;
  readonly userGenderOwnedForGender: boolean | null = null; // German only?
  readonly eatSpaceWhenAdjEndsWithApostrophe: boolean | null = null; // Italian only
  readonly supportsInvertSubjectVerb: boolean | null = null; // German atm
  readonly defaultTense: string | null = null;
  readonly canPopVerbPart: boolean | null = null; // German only
  readonly defaultLastSeparatorForAdjectives: string | null = null;
  readonly universalMapping: Record<string, string> | null = null;
  readonly spacesWhenSeparatingElements: boolean | null = null; // when listing elements, put spaces or not; false e.g. for Chinese

  protected valueManager: ValueManager | null = null;
  protected verbsManager: VerbsManager | null = null;
  protected refsManager: RefsManager | null = null;
  protected genderNumberManager: GenderNumberManager | null = null;
  protected spy: SpyI | null = null;
  protected helper: Helper | null = null;
  protected dictHelper: any;
  languageCommon: LanguageCommon;

  abstract getSubstantive(subst: string, number: Numbers, _theCase: string | undefined): string;

  constructor(languageCommon: LanguageCommon) {
    this.languageCommon = languageCommon;
  }

  public setValueManager(valueManager: ValueManager): void {
    this.valueManager = valueManager;
  }

  public setVerbsManager(verbsManager: VerbsManager): void {
    this.verbsManager = verbsManager;
  }

  public setRefsManager(refsManager: RefsManager): void {
    this.refsManager = refsManager;
  }

  public setGenderNumberManager(genderNumberManager: GenderNumberManager): void {
    this.genderNumberManager = genderNumberManager;
  }

  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }
  protected getSpy(): SpyI {
    return this.spy as SpyI;
  }

  public setHelper(helper: Helper): void {
    this.helper = helper;
  }

  // shortcut
  getDictManager(): DictManager {
    return this.languageCommon.dictManager as DictManager;
  }

  getLanguageCommon(): LanguageCommon {
    return this.languageCommon;
  }

  getDefaultLastSeparatorForAdjectives(): string {
    if (!this.defaultLastSeparatorForAdjectives) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no default last separator for ${this.iso2} language`;
      throw err;
    } else {
      return this.defaultLastSeparatorForAdjectives;
    }
  }

  getDet(_det: DetTypes, _params: DetParams): string {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `determiners not available in ${this.iso2}`;
    throw err;
  }

  /* istanbul ignore next */
  getAgreeAdj(
    _adjective: string,
    _gender: Genders | undefined,
    _number: Numbers,
    _subject: any,
    _params: AgreeAdjParams,
  ): string {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `adjectives not available in ${this.iso2}`;
    throw err;
  }

  getWordGender(_word: string): Genders {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `there is no gender dict for ${this.iso2}, set gender directly`;
    throw err;
  }

  getOrdinal(_val: number, _gender: Genders): string {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `ORDINAL_TEXTUAL not available in ${this.iso2}`;
    throw err;
  }

  // this is explicitely tied to numeral lib
  getFormatNumberWithNumeral(val: number, format: string | undefined): string {
    if (this.langForNumeral) {
      numeral.locale(this.langForNumeral);
      return numeral(val).format(format);
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `FORMAT not available in ${this.iso2}`;
      throw err;
    }
  }

  // this is just a default implementation using numeral, it can be overriden
  getOrdinalNumber(val: number, _gender: Genders | undefined): string {
    if (this.langForNumeral) {
      numeral.locale(this.langForNumeral);
      return numeral(val).format('o');
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `ORDINAL_NUMBER not available in ${this.iso2}`;
      throw err;
    }
  }

  // default implementation using n2words
  getTextualNumber(val: number, _gender: Genders | undefined): string {
    if (this.n2wordsLib && this.n2wordsLang) {
      let res = '';

      if (val % 1 === 0) {
        // is int
        res = this.n2wordsLib(val, { lang: this.n2wordsLang });
      } else {
        // is float
        const splitVal = (val + '').split('.');
        res =
          this.n2wordsLib(parseInt(splitVal[0]), { lang: this.n2wordsLang }) +
          ' ' +
          this.floatingPointWord +
          ' ' +
          this.getTextualNumberFloatPart(splitVal[1]);
      }
      return res;
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `TEXTUAL not available in ${this.iso2}`;
      throw err;
    }
  }

  // very basic default implementation
  private getTextualNumberFloatPart(floatPartString: string): string {
    /* istanbul ignore else */
    if (this.table0to9) {
      const resArr = [];
      for (let i = 0; i < floatPartString.length; i++) {
        resArr.push(this.table0to9[Number(floatPartString.charAt(i))]);
      }
      return resArr.join(' ');
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `TEXTUAL with floating point parts not available in ${this.iso2}`;
      throw err;
    }
  }

  // override if necessary
  getStdFormatedNumber(val: number): string {
    if (this.langForNumeral) {
      numeral.locale(this.langForNumeral);
      return numeral(val).format('0,0.[000000000000]');
    } else {
      // default, not so good
      return val.toString();
    }
  }

  // default implementation using date-fns
  getFormattedDate(date: Date, dateFormat: string | undefined): string {
    return dateFnsFormat(date, dateFormat || this.defaultDateFormat, { locale: this.langForDateFns });
  }

  // possessiveAdj currently only in Italian
  getFormattedNominalGroup(possessiveAdj: string, adjBefore: string, substantive: string, adjAfter: string): string {
    if (!possessiveAdj) {
      // not tested in Chinese
      /* istanbul ignore next */
      const sep = this.spacesWhenSeparatingElements ? '¤' : '';
      return (adjBefore ? adjBefore + sep : '') + substantive + (adjAfter ? sep + adjAfter : '');
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `possessive adjective not available in ${this.iso2}`;
      throw err;
    }
  }

  /* istanbul ignore next */
  parseSimplifiedString(_val: string): GrammarParsed {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `<...> syntax not implemented in ${this.iso2}`;
    throw err;
  }

  // when reference has to be triggered
  thirdPossessionTriggerRef(_owner: any, _owned: any, _params: any): void {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `thirdPossessionTriggerRef not available in ${this.iso2}`;
    throw err;
  }

  // reference has already been triggered
  thirdPossessionRefTriggered(_owner: any, _owned: any, _params: any): void {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `thirdPossessionRefTriggered not available in ${this.iso2}`;
    throw err;
  }

  recipientPossession(_owned: any): void {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `recipientPossession not implemented in ${this.iso2}`;
    throw err;
  }

  // helper to map with language specific conjugation libs
  protected mapPersonToNumber0to5(person: PersonForSentence): 0 | 1 | 2 | 3 | 4 | 5 {
    const personMapping = {
      '1S': 0,
      '2S': 1,
      '3S': 2,
      '1P': 3,
      '2P': 4,
      '3P': 5,
    };
    return personMapping[person] as 0 | 1 | 2 | 3 | 4 | 5;
  }

  // helper to map with language specific conjugation libs
  protected mapPersonToNumber1to3(person: PersonForSentence): 1 | 2 | 3 {
    return {
      '1S': 1,
      '1P': 1,
      '2S': 2,
      '2P': 2,
      '3S': 3,
      '3P': 3,
    }[person] as 1 | 2 | 3;
  }

  // helper to map with language specific conjugation libs
  protected mapPersonToSP(person: PersonForSentence): 'S' | 'P' {
    return {
      '1S': 'S',
      '1P': 'P',
      '2S': 'S',
      '2P': 'P',
      '3S': 'S',
      '3P': 'P',
    }[person] as 'S' | 'P';
  }

  getConjugation(
    _subject: any,
    _verb: string,
    _tense: SomeTense,
    _person: PersonForSentence,
    _conjParams: ConjParams,
    _embeddedVerbs: VerbsInfo | undefined,
    _verbParts: VerbParts,
  ): string {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `verbs not available in ${this.iso2}`;
    throw err;
  }

  isPlural(_val: number): boolean {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `isPlural not implemented in ${this.iso2}`;
    throw err;
  }

  sentence(_sentenceParams: SentenceParams): void {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `sentence mixin not implemented in ${this.iso2}`;
    throw err;
  }

  /* istanbul ignore next */
  getPersonalPronounSubject(_person: PersonForSentence): string {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `personal pronoun subject not implemented in ${this.iso2}`;
    throw err;
  }

  public addSeparatingSpace(): void {
    this.getSpy().appendPugHtml((this.helper as Helper).getSeparatingSpace());
  }

  protected solveTense(originalTense: string): string {
    if (this.universalMapping && this.universalMapping[originalTense]) {
      return this.universalMapping[originalTense];
    } else {
      return originalTense;
    }
  }
}
