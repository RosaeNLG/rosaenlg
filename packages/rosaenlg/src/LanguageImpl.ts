/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Genders, Numbers } from './NlgLib';
import { GenderNumberManager, WithGender, WithNumber } from './GenderNumberManager';
import { RefsManager } from './RefsManager';
import { Helper } from './Helper';
import { AdjPos, ValueManager } from './ValueManager';
import { ConjParams, VerbParts, VerbsManager } from './VerbsManager';
import { SentenceParams, SubjectGroup } from './SentenceManager';
import { SpyI } from './Spy';
import numeral from 'numeral';
import { Locale as dateFnsLocale, format as dateFnsFormat } from 'date-fns';
import { LanguageCommon, DictManager, VerbsInfo } from 'rosaenlg-commons';
export type DetTypes = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';
export { Numbers } from './NlgLib';

export interface DetParams {
  genderOwned: Genders;
  numberOwned: Numbers;
  genderOwner: Genders;
  numberOwner: Numbers;
  case?: string; // German only / GermanCases
  dist?: string; // English and Spanish / EnglishDist | SpanishDist
  after?: string; // Spanish and French
  useTheWhenPlural?: boolean; // English only
  adjectiveAfterDet?: boolean; // French only de/des
  forceDes?: boolean; // French only de/des
}

export interface AgreeAdjParams extends WithGender, WithNumber {
  adjPos: AdjPos;
  case?: string; // German only / GermanCases
  det: DetTypes;
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
  iso2: string;
  readonly langForNumeral: string; // when using numeral
  readonly langForDateFns: dateFnsLocale; // when using date-fns
  readonly defaultDateFormat = 'yyyy-MM-dd';
  readonly n2wordsLang: string; // when using n2words
  readonly n2wordsLib: (_: number, options: any) => string; // when using n2words
  readonly floatingPointWord: string; // when using n2words
  readonly table0to9: string[];
  readonly hasGender: boolean;
  readonly hasNeutral: boolean;
  readonly defaultAdjPos: string; // 'BEFORE' or 'AFTER'
  readonly hasCase: boolean;
  readonly defaultCase: string;
  readonly userGenderOwnedForGender: boolean; // German only?
  readonly eatSpaceWhenAdjEndsWithApostrophe: boolean; // Italian only
  readonly supportsInvertSubjectVerb: boolean; // German atm
  readonly defaultTense: string;
  readonly canPopVerbPart: boolean; // German only
  readonly defaultLastSeparatorForAdjectives: string;
  readonly universalMapping: Record<UniversalTense, string>;
  readonly spacesWhenSeparatingElements: boolean; // when listing elements, put spaces or not; false e.g. for Chinese

  protected valueManager: ValueManager;
  protected verbsManager: VerbsManager;
  protected refsManager: RefsManager;
  protected genderNumberManager: GenderNumberManager;
  protected spy: SpyI;
  protected helper: Helper;
  protected dictHelper: any;
  languageCommon: LanguageCommon;

  abstract getSubstantive(subst: string, number: Numbers, _theCase: string): string;

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

  public setHelper(helper: Helper): void {
    this.helper = helper;
  }

  // shortcut
  getDictManager(): DictManager {
    return this.languageCommon.dictManager;
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
  getAgreeAdj(_adjective: string, _gender: Genders, _number: Numbers, _subject: any, _params: AgreeAdjParams): string {
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
  getFormatNumberWithNumeral(val: number, format: string): string {
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
  getOrdinalNumber(val: number, _gender: Genders): string {
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
  getTextualNumber(val: number, _gender: Genders): string {
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
  getFormattedDate(date: Date, dateFormat: string): string {
    return dateFnsFormat(date, dateFormat || this.defaultDateFormat, { locale: this.langForDateFns });
  }

  // possessiveAdj currently only in Italian
  getFormattedNominalGroup(possessiveAdj: string, adjBefore: string, substantive: string, adjAfter: string): string {
    if (!possessiveAdj) {
      // not tested in Chinese
      /* istanbul ignore next */
      const sep = this.spacesWhenSeparatingElements ? '¤' : '';
      return adjBefore + sep + substantive + sep + adjAfter;
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

  getConjugation(
    _subject: any,
    _verb: string,
    _tense: SomeTense,
    _number: Numbers,
    _conjParams: ConjParams,
    _embeddedVerbs: VerbsInfo,
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

  protected sentenceDoSubject(subjectGroup: SubjectGroup): void {
    if (subjectGroup.noSubject !== true) {
      this.valueManager.value(subjectGroup.subject, null);
      this.addSeparatingSpace();
    }
  }

  public addSeparatingSpace(): void {
    this.spy.appendPugHtml(this.helper.getSeparatingSpace());
  }

  protected solveTense(originalTense: string): string {
    if (this.universalMapping && this.universalMapping[originalTense]) {
      return this.universalMapping[originalTense];
    } else {
      return originalTense;
    }
  }
}
