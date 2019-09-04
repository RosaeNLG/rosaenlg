import { RefsManager, RepresentantType } from './RefsManager';
import { RandomManager } from './RandomManager';
import { AdjectiveManager } from './AdjectiveManager';
import { SubstantiveManager } from './SubstantiveManager';
import { Helper } from './Helper';
import { GenderNumberManager } from './GenderNumberManager';
import { getOrdinal as getGermanOrdinal } from 'german-ordinals';
import { getOrdinal as getFrenchOrdinal } from 'french-ordinals';
import {
  getCardinal as getItalianCardinal,
  getOrdinal as getItalianOrdinal,
} from 'italian-ordinals-cardinals';
import { getDet, DetTypes } from './Determiner';
import { PossessiveManager } from './PossessiveManager';
import { Languages, DictHelper, Numbers, Genders, GermanCases } from './NlgLib';
import { AsmManager } from './AsmManager';

import { parse as frenchParse } from '../dist/french-grammar.js';
import { parse as germanParse } from '../dist/german-grammar.js';
import { parse as englishParse } from '../dist/english-grammar.js';
import { parse as italianParse } from '../dist/italian-grammar.js';

import * as compromise from 'compromise';

import * as writtenNumber from 'written-number';
import * as writeInt from 'write-int';
import * as numeral from 'numeral';
import 'numeral/locales/de';
import 'numeral/locales/fr';
import 'numeral/locales/it';

import * as moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/it';
import { Dist } from '../../english-determiners/dist';

//import * as Debug from "debug";
//const debug = Debug("rosaenlg");

export type AdjPos = 'BEFORE' | 'AFTER';

type AdjStructure = string | string[];

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
  adj: AdjStructure;
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
  possessiveAdj: string; // it_IT only
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
  private dictHelper: DictHelper;
  private asmManager: AsmManager;

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
    asmManager: AsmManager,
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
    this.asmManager = asmManager;
  }
  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  public value(obj: any, params: ValueParams): void {
    // params is string when date
    if (typeof obj === 'string' && obj.charAt(0) === '<' && obj.charAt(obj.length - 1) === '>') {
      this.valueSimplifiedString(obj.substring(1, obj.length - 1), params);
      return; // don't do the rest, as it will call value again indirectly
    }

    if (params && params.owner) {
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
      this.spy.appendPugHtml(this.valueDate(obj, params ? params.dateFormat : null));
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

    if (params && params.represents) {
      this.genderNumberManager.setRefGender(params.represents, obj, params);
      // we cannot use setRefGenderNumber because sometimes obj is a word => dict lookup
      if (params.number) {
        this.genderNumberManager.setRefNumber(params.represents, params.number);
      }
    }
  }

  private getLangForMoment(): string {
    if (['fr_FR', 'en_US', 'de_DE', 'it_IT'].indexOf(this.language) > -1) {
      return this.language.replace('_', '-');
    } else {
      return null;
    }
  }

  private valueDate(val: Date, dateFormat: string): string {
    //console.log(`FORMAT: ${dateFormat}`);
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_DATE';
    } else {
      if (this.getLangForMoment()) {
        let localLocale = moment(val);
        localLocale.locale(this.getLangForMoment());
        return this.helper.protectString(localLocale.format(dateFormat));
      } else {
        // default when other language
        let localLocale = moment(val);
        localLocale.locale('en-US');
        return this.helper.protectString(localLocale.format('YYYY-MM-DD'));
      }
    }
  }

  private valueSimplifiedString(val: string, params: ValueParams): void {
    if (this.spy.isEvaluatingEmpty()) {
      this.spy.appendPugHtml('SOME_STRING');
      return;
    }

    const supportedLanguages: string[] = ['fr_FR', 'de_DE', 'en_US', 'it_IT'];
    /* istanbul ignore if */
    if (supportedLanguages.indexOf(this.language) === -1) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `<...> syntax not implemented in ${this.language}`;
      throw err;
    }

    let solved: GrammarParsed;

    solved = this.simplifiedStringsCache[val];
    if (!solved) {
      // debug(`BEFORE: #${val}#`);
      try {
        switch (this.language) {
          case 'fr_FR':
            solved = frenchParse(val, { dictHelper: this.dictHelper });
            break;
          case 'de_DE':
            solved = germanParse(val, { dictHelper: this.dictHelper });
            break;
          case 'it_IT':
            solved = italianParse(val, { dictHelper: this.dictHelper });
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
    if (params && params.debug) {
      console.log(`DEBUG: <${val}> => ${JSON.stringify(solved)} - final: ${solved.noun} ${JSON.stringify(newParams)}`);
    }
    this.value(solved.noun, newParams);
  }

  private valueString(val: string, params: ValueParams): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_STRING';
    }

    if (this.language === 'de_DE') {
      params.case = params.case || 'NOMINATIVE';
    }

    if (params.possessiveAdj && this.language != 'it_IT') {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'possessiveAdj param is only valid in it_IT';
      throw err;
    }

    // to check depending on language
    params.genderOwned = this.genderNumberManager.getRefGender(val, params);

    // if number is set, by default it is for the owneD thing, not the ownerR
    params.numberOwned = params.numberOwned || params.number || 'S';

    // debug(`here for ${val} with params: ${JSON.stringify(params)}`);

    let det = '';
    if (params && params.det) {
      det = getDet(this.language, params.det, params); // can return ''
    }

    let self = this;
    function getAdjStringFromList(adjectives: string[]): string {
      if (!adjectives || adjectives.length === 0) {
        return '';
      }
      let agreedAdjs = [];
      for (let i = 0; i < adjectives.length; i++) {
        agreedAdjs.push(self.adjectiveManager.getAgreeAdj(adjectives[i], val, params));
      }

      let lastSep = agreedAdjs.length > 1 ? ' ' + self.asmManager.getDefaultLastSeparator() + ' ' : null;
      switch (agreedAdjs.length) {
        case 1:
          return agreedAdjs[0];
        case 2:
          return agreedAdjs.join(lastSep);
        default:
          return agreedAdjs.slice(0, agreedAdjs.length - 1).join(', ') + lastSep + agreedAdjs[agreedAdjs.length - 1];
      }
    }

    let adjPos: AdjPos;
    if (params && params.adjPos) {
      adjPos = params.adjPos;
      if (adjPos && adjPos != 'AFTER' && adjPos != 'BEFORE') {
        let err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = 'adjective position must be either AFTER or BEFORE';
        throw err;
      }
    }
    if (!adjPos) {
      const defaultAdjPos = {
        // French: In general, and unlike English, French adjectives are placed after the noun they describe
        // eslint-disable-next-line @typescript-eslint/camelcase
        fr_FR: 'AFTER',
        // Italian l'adjectif qualificatif se place généralement après le nom mais peut également le précéder
        // eslint-disable-next-line @typescript-eslint/camelcase
        it_IT: 'AFTER',
        // eslint-disable-next-line @typescript-eslint/camelcase
        en_US: 'BEFORE',
        // eslint-disable-next-line @typescript-eslint/camelcase
        de_DE: 'BEFORE',
      };
      adjPos = defaultAdjPos[this.language];
    }

    let adjBefore = '';
    let adjAfter = '';

    {
      let adj = null; // used when not BEFORE + AFTER combined
      if (params && params.adj) {
        if (typeof params.adj === 'string' || params.adj instanceof String) {
          adj = getAdjStringFromList([params.adj as string]);
        } else if (Array.isArray(params.adj)) {
          adj = getAdjStringFromList(params.adj);
        } else if (typeof params.adj === 'object') {
          if (!params.adj['BEFORE'] && !params.adj['AFTER']) {
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = 'adj param has an invalid structure: is an object but no BEFORE or AFTER key';
            throw err;
          }
          adjBefore = getAdjStringFromList(params.adj['BEFORE']);
          adjAfter = getAdjStringFromList(params.adj['AFTER']);
        } else {
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = 'adj param has an invalid structure';
          throw err;
        }
        if (adj) {
          switch (adjPos) {
            case 'BEFORE':
              adjBefore = adj;
              break;
            case 'AFTER':
              adjAfter = adj;
              break;
          }
        }
      }
    }

    const valSubst: string = this.substantiveManager.getSubstantive(val, null, params);

    switch (this.language) {
      case 'en_US':
        return `${det} ${adjBefore} ${valSubst} ${adjAfter}`;
      case 'de_DE':
        return `${det} ${adjBefore} ${valSubst} ${adjAfter}`;
      case 'it_IT':
        let possessiveAdj = '';
        if (params.possessiveAdj) {
          possessiveAdj = this.adjectiveManager.getAgreeAdj(params.possessiveAdj, val, params);
        }
        if (adjBefore.endsWith("'")) {
          // bell'uomo
          return `${det} ${possessiveAdj} ${adjBefore}${valSubst} ${adjAfter}`;
        } else {
          return `${det} ${possessiveAdj} ${adjBefore} ${valSubst} ${adjAfter}`;
        }
      case 'fr_FR':
        // in French, the potential change of the adj based on its position (vieux => vieil) is already done
        return `${det} ${adjBefore} ${valSubst} ${adjAfter}`;
      default:
        return `${det} ${adjBefore} ${valSubst} ${adjAfter}`;
    }
  }

  private valueObject(obj: any, params: ValueParams): void {
    // debug(obj);

    //- we already have the next one
    if (this.refsManager.getNextRef(obj)) {
      // debug('we already have the next one');
      this.randomManager.setRndNextPos(this.refsManager.getNextRef(obj).rndNextPos);
      this.refsManager.deleteNextRef(obj);
    }

    if (params && params.REPRESENTANT === 'ref') {
      this.valueRef(obj, params);
    } else if (params && params.REPRESENTANT === 'refexpr') {
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

  private getLangForNumeral(): string {
    if (['fr_FR', 'en_US', 'de_DE', 'it_IT'].indexOf(this.language) > -1) {
      return this.language.split('_')[0];
    } else {
      return null;
    }
  }

  private valueNumber(val: number, params: ValueParams): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_NUMBER';
    } else {
      if (params && params.AS_IS) {
        return this.helper.protectString(val.toString());
      } else if (params && params.FORMAT) {
        let format: string = params.FORMAT;
        if (this.getLangForNumeral()) {
          numeral.locale(this.getLangForNumeral());
          return this.helper.protectString(numeral(val).format(format));
        } else {
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `FORMAT not available in ${this.language}`;
          throw err;
        }
      } else if (params && params.TEXTUAL) {
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
          case 'it_IT':
            return getItalianCardinal(val);
          default:
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `TEXTUAL not available in ${this.language}`;
            throw err;
        }
      } else if (params && params.ORDINAL_NUMBER) {
        if (this.getLangForNumeral()) {
          numeral.locale(this.getLangForNumeral());
          return this.helper.protectString(numeral(val).format('o'));
        } else {
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `ORDINAL_NUMBER not available in ${this.language}`;
          throw err;
        }
      } else if (params && params.ORDINAL_TEXTUAL) {
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
          case 'it_IT':
            return getItalianOrdinal(val);
          default:
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `ORDINAL_TEXTUAL not available in ${this.language}`;
            throw err;
        }
      } else {
        if (this.getLangForNumeral()) {
          numeral.locale(this.getLangForNumeral());
          return this.helper.protectString(numeral(val).format('0,0.[000000000000]'));
        } else {
          return this.helper.protectString(val.toString());
        }
      }
    }
  }
}
