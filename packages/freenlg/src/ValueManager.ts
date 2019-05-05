import { RefsManager, RepresentantType } from './RefsManager';
import { RandomManager } from './RandomManager';
import { AdjectiveManager } from './AdjectiveManager';
import { SubstantiveManager } from './SubstantiveManager';
import { Helper } from './Helper';
import { GenderNumberManager } from './GenderNumberManager';
import { getOrdinal as getGermanOrdinal } from 'german-ordinals';
import { getOrdinal as getFrenchOrdinal } from 'french-ordinals';
import { getDet, DetTypes } from './Determiner';
import { PossessiveManager } from './PossessiveManager';
import { LefffHelper } from 'lefff-helper';
import { GermanDictHelper } from 'german-dict-helper';
import { Languages, DictHelper, Numbers, Genders, GermanCases } from './NlgLib';

import { parse as frenchParse } from '../dist/french-grammar.js';
import { parse as germanParse } from '../dist/german-grammar.js';
import { parse as englishParse } from '../dist/english-grammar.js';

import * as compromise from 'compromise';

import * as writtenNumber from 'written-number';
import * as writeInt from 'write-int';
import * as numeral from 'numeral';
import 'numeral/locales/de';
import 'numeral/locales/fr';

import * as moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/de';
import { Dist } from '../../english-determiners/dist';
import { date } from 'random-js';

//import * as Debug from "debug";
//const debug = Debug("freenlg");

export type AdjPos = 'BEFORE' | 'AFTER';

export interface ValueParams {
  owner: any;
  represents: any;
  gender: Genders;
  number: Numbers;
  genderOwned: Genders;
  numberOwned: Numbers;
  genderOwner: Genders;
  numberOwner: Numbers;
  case: GermanCases;
  det: DetTypes;
  adj: string;
  adjPos: AdjPos;
  dist: Dist;
  debug: boolean;
  dateFormat: string;
  REPRESENTANT: RepresentantType;
  AS_IS: boolean;
  TEXTUAL: boolean;
  ORDINAL_NUMBER: boolean;
  ORDINAL_TEXTUAL: boolean;
  FORMAT: string;
}
interface GrammarParsed extends ValueParams {
  gender: Genders;
  unknownNoun: boolean;
  noun: string;
}

export class ValueManager {
  private language: Languages;
  private refsManager: RefsManager;
  private genderNumberManager: GenderNumberManager;
  private randomManager: RandomManager;
  private adjectiveManager: AdjectiveManager;
  private substantiveManager: SubstantiveManager;
  private helper: Helper;
  private possessiveManager: PossessiveManager;
  private dictHelper: LefffHelper | GermanDictHelper;

  private spy: Spy;

  private simplifiedStringsCache: any[] = [];

  public constructor(
    language: Languages,
    refsManager: RefsManager,
    genderNumberManager: GenderNumberManager,
    randomManager: RandomManager,
    adjectiveManager: AdjectiveManager,
    substantiveManager: SubstantiveManager,
    helper: Helper,
    possessiveManager: PossessiveManager,
    dictHelper: DictHelper,
  ) {
    this.language = language;
    this.refsManager = refsManager;
    this.genderNumberManager = genderNumberManager;
    this.randomManager = randomManager;
    this.adjectiveManager = adjectiveManager;
    this.substantiveManager = substantiveManager;
    this.helper = helper;
    this.possessiveManager = possessiveManager;
    this.dictHelper = dictHelper;
  }
  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  public value(obj: any, params: ValueParams): void {
    // params is string when date
    if (typeof obj === 'string' && obj.charAt(0) == '<' && obj.charAt(obj.length - 1) == '>') {
      this.valueSimplifiedString(obj.substring(1, obj.length - 1), params);
      return; // don't do the rest, as it will call value again indirectly
    }

    if (params != null && params.owner != null) {
      let newParams: ValueParams = Object.assign({}, params as ValueParams);
      newParams.owner = null; // to avoid looping: we already take into account that param
      this.possessiveManager.thirdPossession(params.owner, obj, newParams);
      return;
    }

    if (typeof obj === 'number') {
      this.spy.appendPugHtml(this.valueNumber(obj, params));
    } else if (typeof obj === 'string') {
      this.spy.appendPugHtml(this.valueString(obj, params));
    } else if (obj instanceof Date) {
      this.spy.appendPugHtml(this.valueDate(obj, params.dateFormat));
    } else if (obj.isAnonymous) {
      // do nothing
    } else if (typeof obj === 'object') {
      // it calls mixins, it already appends
      this.valueObject(obj, params);
    } else {
      let err = new Error();
      err.name = 'TypeError';
      err.message = `value not possible on: ${JSON.stringify(obj)}`;
      throw err;
    }

    if (params != null && params.represents != null) {
      this.genderNumberManager.setRefGender(params.represents, obj, params);
      // we cannot use setRefGenderNumber because sometimes obj is a word => dict lookup
      if (params.number != null) {
        this.genderNumberManager.setRefNumber(params.represents, params.number);
      }
    }
  }

  private valueDate(val: Date, dateFormat: string): string {
    //console.log(`FORMAT: ${dateFormat}`);
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_DATE';
    } else {
      var localLocale = moment(val);
      localLocale.locale(this.language.replace('_', '-'));
      return this.helper.protectString(localLocale.format(dateFormat));
    }
  }

  private valueSimplifiedString(val: string, params: ValueParams): void {
    if (this.spy.isEvaluatingEmpty()) {
      this.spy.appendPugHtml('SOME_STRING');
      return;
    }

    const supportedLanguages: string[] = ['fr_FR', 'de_DE', 'en_US'];
    /* istanbul ignore if */
    if (supportedLanguages.indexOf(this.language) == -1) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `<...> syntax not implemented in ${this.language}`;
      throw err;
    }

    let solved: GrammarParsed;

    solved = this.simplifiedStringsCache[val];
    if (solved == null) {
      // debug(`BEFORE: #${val}#`);
      try {
        switch (this.language) {
          case 'fr_FR':
            solved = frenchParse(val, { dictHelper: this.dictHelper });
            break;
          case 'de_DE':
            solved = germanParse(val, { dictHelper: this.dictHelper });
            break;
          case 'en_US':
            solved = englishParse(val, {
              /* no dict */
            });
            break;
        }
        // debug(solved);

        // manager unknown words
        if (solved.unknownNoun) {
          if (solved.gender != 'M' && solved.gender != 'F' && solved.gender != 'N') {
            let err = new Error();
            err.name = 'NotFoundInDict';
            err.message = `${solved.noun} is not in dict. Indicate a gender, M F or N!`;
            throw err;
          }
          delete solved['unknownNoun'];
        }

        this.simplifiedStringsCache[val] = solved;
      } catch (e) {
        let err = new Error();
        err.name = 'ParseError';
        err.message = `could not parse <${val}>: ${e.message}`;
        throw err;
      }
    }

    // we keep the params
    let newParams: GrammarParsed = Object.assign({}, solved, params);
    delete newParams['noun'];
    if (params != null && params.debug) {
      console.log(`DEBUG: <${val}> => ${JSON.stringify(solved)} - final: ${solved.noun} ${JSON.stringify(newParams)}`);
    }
    this.value(solved.noun, newParams);
  }

  private valueString(val: string, params: ValueParams): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_STRING';
    }

    if (this.language == 'de_DE') {
      params.case = params.case || 'NOMINATIVE';
    }

    // to check depending on language
    params.genderOwned = this.genderNumberManager.getRefGender(val, params);

    // if number is set, by default it is for the owneD thing, not the ownerR
    params.numberOwned = params.numberOwned || params.number || 'S';

    // debug(`here for ${val} with params: ${JSON.stringify(params)}`);

    var det = '';
    if (params != null && params.det != null) {
      det = getDet(this.language, params.det, params); // can return ''
    }

    var adj = '';
    if (params != null && params.adj != null) {
      adj = this.adjectiveManager.getAgreeAdj(params.adj, val, params);
    }

    const valSubst: string = this.substantiveManager.getSubstantive(val, null, params);

    switch (this.language) {
      case 'en_US':
        return `${det} ${adj} ${valSubst}`;
      case 'de_DE':
        return `${det} ${adj} ${valSubst}`;
      case 'fr_FR':
        let adjPos: AdjPos;
        if (params != null && params.adjPos != null) {
          adjPos = params.adjPos;
        } else {
          // In general, and unlike English, French adjectives are placed after the noun they describe
          adjPos = 'AFTER';
        }

        if (adjPos != 'AFTER' && adjPos != 'BEFORE') {
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = 'adjective position must be either AFTER or BEFORE';
          throw err;
        }

        if (adjPos == 'AFTER') {
          return `${det} ${valSubst} ${adj}`;
        } else {
          // the potentiel change of the adj based on its position (vieux => vieil) is already done
          return `${det} ${adj} ${valSubst}`;
        }
    }
  }

  private valueObject(obj: any, params: ValueParams): void {
    // debug(obj);

    //- we already have the next one
    if (this.refsManager.getNextRef(obj) != null) {
      // debug('we already have the next one');
      this.randomManager.setRndNextPos(this.refsManager.getNextRef(obj).rndNextPos);
      this.refsManager.deleteNextRef(obj);
    }

    if (params != null && params.REPRESENTANT == 'ref') {
      this.valueRef(obj, params);
    } else if (params != null && params.REPRESENTANT == 'refexpr') {
      this.valueRefexpr(obj, params);
    } else if (!this.refsManager.hasTriggeredRef(obj)) {
      this.valueRef(obj, params);
    } else if (obj.refexpr) {
      this.valueRefexpr(obj, params);
    } else {
      //- we trigger ref if obj has no refexpr
      this.valueRef(obj, params);
    }
  }

  private valueRefexpr(obj: any, params: ValueParams): void {
    // debug('refexpr: ' + JSON.stringify(params));
    // is only called when obj.refexpr has a value
    this.spy.getPugMixins()[obj.refexpr](obj, params);
  }

  private valueRef(obj: any, params: any): void {
    //- printObj('value_ref', obj)
    if (obj.ref) {
      // debug('value_ref_ok: ' + obj.ref);
      this.spy.getPugMixins()[obj.ref](obj, params);
    } else {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${JSON.stringify(obj)} has no ref mixin`;
      throw err;
    }
    this.refsManager.setTriggeredRef(obj);
  }

  private valueNumber(val: number, params: ValueParams): string {
    const langForNumeral: string = this.language.split('_')[0];

    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_NUMBER';
    } else {
      if (params != null && params.AS_IS) {
        return val.toString();
      } else if (params != null && params.FORMAT != null) {
        let format: string = params.FORMAT;
        numeral.locale(langForNumeral);
        return this.helper.protectString(numeral(val).format(format));
      } else if (params != null && params.TEXTUAL) {
        switch (this.language) {
          case 'en_US':
            return compromise(val)
              .values()
              .toText()
              .all()
              .out();
          case 'fr_FR':
            return writtenNumber(val, { lang: 'fr' });
          case 'de_DE':
            // unfortunately written-number does not support German, while write-int does not support French
            return writeInt(val, { lang: 'de' });
        }
      } else if (params != null && params.ORDINAL_NUMBER) {
        // tested for en_US fr_FR de_DE
        numeral.locale(langForNumeral);
        return this.helper.protectString(numeral(val).format('o'));
      } else if (params != null && params.ORDINAL_TEXTUAL) {
        switch (this.language) {
          case 'en_US':
            return compromise(val)
              .values()
              .toText()
              .all()
              .values()
              .toOrdinal()
              .all()
              .out();
          case 'fr_FR':
            return getFrenchOrdinal(val);
          case 'de_DE':
            return getGermanOrdinal(val);
        }
      } else {
        // tested for en_US fr_FR de_DE
        numeral.locale(langForNumeral);
        return this.helper.protectString(numeral(val).format('0,0.[000000000000]'));
      }
    }
  }
}
