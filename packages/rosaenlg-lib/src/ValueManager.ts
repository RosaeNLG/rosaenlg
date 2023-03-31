/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Constants } from 'rosaenlg-commons';
import { AdjectiveManager } from './AdjectiveManager';
import { GenderNumberManager } from './GenderNumberManager';
import { Helper } from './Helper';
import { PossForm } from './LanguageEnglish';
import { DetParams, DetTypes, GrammarParsed, LanguageImpl } from './LanguageImpl';
import { Genders, Numbers, Persons } from './NlgLib';
import { PossessiveManager } from './PossessiveManager';
import { RandomManager } from './RandomManager';
import { ObjWithRefs, RefsManager, RepresentantType } from './RefsManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { SpyI } from './Spy';
import { SynManager } from './SynManager';

import { Dist } from '../../english-determiners/dist';

export type AdjPos = 'BEFORE' | 'AFTER';

type AdjStructure = string | string[];

export interface ValueParams {
  owner?: any;
  represents?: any;
  gender?: Genders;
  number?: Numbers;
  genderOwned?: Genders;
  numberOwned?: Numbers;
  genderOwner?: Genders;
  numberOwner?: Numbers;
  personOwner?: Persons;
  case?: string; // GermanCases
  det?: DetTypes;
  adj?: AdjStructure;
  adjPos?: AdjPos;
  dist?: Dist;
  debug?: boolean;
  dateFormat?: string;
  REPRESENTANT?: RepresentantType;
  AS_IS?: boolean;
  TEXTUAL?: boolean;
  ORDINAL_NUMBER?: boolean;
  ORDINAL_TEXTUAL?: boolean;
  FORMAT?: string;
  possessiveAdj?: string; // it_IT only
  agree?: any; // when ORDINAL_TEXTUAL, for some languages
  useTheWhenPlural?: boolean; // when a definite determiner and plural, en_US only
  FORCE_DES?: boolean; // French only
  possForm?: PossForm;
}

interface AdjBeforeAndAfter {
  before: string;
  after: string;
}

function isSimplifiedString(obj: any): boolean {
  return typeof obj === 'string' && obj.charAt(0) === '<' && obj.charAt(obj.length - 1) === '>';
}

export class ValueManager {
  private languageImpl: LanguageImpl;
  private refsManager: RefsManager;
  private genderNumberManager: GenderNumberManager;
  private randomManager: RandomManager;
  private adjectiveManager: AdjectiveManager;
  private helper: Helper;
  private possessiveManager: PossessiveManager;
  private synManager: SynManager;
  private saveRollbackManager: SaveRollbackManager;

  private spy: SpyI;

  private simplifiedStringsCache: Map<string, GrammarParsed>;
  private constants: Constants;

  public constructor(
    languageImpl: LanguageImpl,
    refsManager: RefsManager,
    genderNumberManager: GenderNumberManager,
    randomManager: RandomManager,
    adjectiveManager: AdjectiveManager,
    helper: Helper,
    possessiveManager: PossessiveManager,
    synManager: SynManager,
    saveRollbackManager: SaveRollbackManager,
    constants: Constants,
  ) {
    this.languageImpl = languageImpl;
    this.refsManager = refsManager;
    this.genderNumberManager = genderNumberManager;
    this.randomManager = randomManager;
    this.adjectiveManager = adjectiveManager;
    this.helper = helper;
    this.possessiveManager = possessiveManager;
    this.synManager = synManager;
    this.simplifiedStringsCache = new Map();
    this.saveRollbackManager = saveRollbackManager;
    this.constants = constants;
  }
  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }

  // once the element in the array is chosen
  private valueOfFirstParam(firstParam: any, params: ValueParams): void {
    if (typeof firstParam === 'number') {
      this.spy.appendPugHtml(this.valueNumber(firstParam, params));
    } else if (typeof firstParam === 'string') {
      this.spy.appendPugHtml(this.valueString(firstParam, params));
    } else if (firstParam instanceof Date) {
      this.spy.appendPugHtml(this.valueDate(firstParam, params ? params.dateFormat : null));
    } else if (firstParam.isAnonymous) {
      // do nothing
    } else if (typeof firstParam === 'object') {
      // it calls mixins, it already appends
      this.valueObject(firstParam, params);
    } else if (typeof firstParam === 'function') {
      // it is supposed to be a mixin, but we can't really check, so we just call it, with the params
      const theMixinFct: (...args: any[]) => void = firstParam;
      theMixinFct(params);
    } else {
      const err = new Error();
      err.name = 'TypeError';
      err.message = `value not possible on: ${JSON.stringify(firstParam)}`;
      throw err;
    }
  }

  public value(obj: any, params: ValueParams): void {
    if (typeof obj === 'undefined' || obj === null) {
      // PS: value of empty string is OK
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `first parameter of value is null or undefined`;
      throw err;
    }

    // param is simplified string
    if (isSimplifiedString(obj)) {
      this.valueSimplifiedString(obj.substring(1, obj.length - 1), params);
      return; // don't do the rest, as it will call value again indirectly
    }

    if (params && params.owner) {
      const newParams: ValueParams = Object.assign({}, params);
      newParams.owner = null; // to avoid looping: we already take into account that param
      this.possessiveManager.thirdPossession(params.owner, obj, newParams);
      return;
    }

    // if first param is an array: we choose one
    const firstParam = this.synManager.synFctHelper(obj);

    // makes the real job
    this.valueOfFirstParam(firstParam, params);

    if (params && params.represents) {
      this.genderNumberManager.setRefGender(params.represents, firstParam, params);
      // we cannot use setRefGenderNumber because sometimes obj is a word => dict lookup
      if (params.number) {
        this.genderNumberManager.setRefNumber(params.represents, params.number);
      }
    }
  }

  private valueDate(val: Date, dateFormat: string): string {
    if (this.saveRollbackManager.isEvaluatingEmpty) {
      return 'SOME_DATE';
    } else {
      // we can't protect all: e.g. "avril" in French must not be protected (d'avril)
      // but we can/must protect everything that has numbers, : or , in it
      const original = this.languageImpl.getFormattedDate(val, dateFormat);

      const regexDe = new RegExp(`[^${this.constants.tousCaracteresMinMajRe}].*`);
      const res = original.replace(regexDe, '<protect>$&</protect>');

      /*
        sample protected output:
          14 avril 1980 => 14§ avril 1980§
          1er juin 2018 => 1er§ juin 2018§
          avril => avril
          14 avril 1980 à 14:40 => 14§ avril 1980 à 14:40§        
      */

      return res;
    }
  }

  private valueSimplifiedString(val: string, params: ValueParams): void {
    if (this.saveRollbackManager.isEvaluatingEmpty) {
      this.spy.appendPugHtml('SOME_STRING');
      return;
    }

    let solved: GrammarParsed;

    solved = this.simplifiedStringsCache.get(val);
    if (!solved) {
      try {
        solved = this.languageImpl.parseSimplifiedString(val);

        // manager unknown words
        if (solved.unknownNoun) {
          if (solved.gender != 'M' && solved.gender != 'F' && solved.gender != 'N') {
            const err = new Error();
            err.name = 'NotFoundInDict';
            err.message = `${solved.noun} is not in dict. Indicate a gender, M F or N!`;
            throw err;
          }
          delete solved['unknownNoun'];
        }

        this.simplifiedStringsCache.set(val, solved);
      } catch (e) {
        const err = new Error();
        err.name = 'ParseError';
        err.message = `could not parse <${val}>: ${e.message}`;
        throw err;
      }
    }

    // we keep the params
    const newParams: ValueParams = Object.assign({}, solved, params);
    delete newParams['noun'];
    if (params && params.debug) {
      console.log(`DEBUG: <${val}> => ${JSON.stringify(solved)} - final: ${solved.noun} ${JSON.stringify(newParams)}`);
    }
    this.value(solved.noun, newParams);
  }

  private getAdjPos(adjPosParams: ValueParams): AdjPos {
    let adjPos: AdjPos;
    if (adjPosParams && adjPosParams.adjPos) {
      adjPos = adjPosParams.adjPos;
      if (adjPos && adjPos != 'AFTER' && adjPos != 'BEFORE') {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = 'adjective position must be either AFTER or BEFORE';
        throw err;
      }
    }
    if (!adjPos) {
      adjPos = this.languageImpl.defaultAdjPos as AdjPos;
    }
    return adjPos;
  }

  private getAdjStringFromList(
    val: string,
    params: ValueParams,
    adjectives: string[],
    separator: string,
    adjPos: AdjPos,
  ): string {
    if (!adjectives || adjectives.length === 0) {
      return '';
    }
    const agreedAdjs = [];
    for (const adjective of adjectives) {
      agreedAdjs.push(
        this.adjectiveManager.getAgreeAdj(
          adjective,
          val,
          {
            gender: params.gender,
            genderOwned: params.genderOwned,
            number: params.number,
            numberOwned: params.numberOwned,
            case: params.case,
            det: params.det,
            adjPos: adjPos, // we cannot use the params direct here: possible mix of before and after
          }, // we only copy the params that we really need
        ),
      );
    }
    let lastSep: string = null;
    if (agreedAdjs.length > 1) {
      let between: string;
      if (separator != null) {
        between = separator;
      } else {
        between = this.languageImpl.getDefaultLastSeparatorForAdjectives();
      }
      lastSep = this.helper.getSeparatingSpace() + between + this.helper.getSeparatingSpace();
    }
    switch (agreedAdjs.length) {
      case 1:
        return agreedAdjs[0];
      case 2:
        return agreedAdjs.join(lastSep);
      default:
        return agreedAdjs.slice(0, agreedAdjs.length - 1).join(', ') + lastSep + agreedAdjs[agreedAdjs.length - 1];
    }
  }

  private getAdjBeforeAndAfter(val: string, params: ValueParams): AdjBeforeAndAfter {
    const res: AdjBeforeAndAfter = { before: '', after: '' };
    if (params && params.adj) {
      if (params.adj['BEFORE'] || params.adj['AFTER']) {
        // is an object with BEFORE and AFTER params
        res.before = this.getAdjStringFromList(val, params, params.adj['BEFORE'], params.adj['SEP_BEFORE'], 'BEFORE');
        res.after = this.getAdjStringFromList(val, params, params.adj['AFTER'], params.adj['SEP_AFTER'], 'AFTER');
      } else {
        let adj = null; // used when not BEFORE + AFTER combined
        const adjPos = this.getAdjPos(params);
        if (typeof params.adj === 'string' || params.adj instanceof String) {
          adj = this.getAdjStringFromList(val, params, [params.adj as string], null, adjPos);
        } else if (Array.isArray(params.adj)) {
          adj = this.getAdjStringFromList(val, params, params.adj, null, adjPos);
        } else {
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = 'adj param has an invalid structure';
          throw err;
        }
        switch (adjPos) {
          case 'BEFORE': {
            res.before = adj;
            break;
          }
          case 'AFTER': {
            res.after = adj;
            break;
          }
        }
      }
    }

    return res;
  }

  private valueString(val: string, params: ValueParams): string {
    if (this.saveRollbackManager.isEvaluatingEmpty) {
      return 'SOME_STRING';
    }

    // simplest case but edge case
    if (!params) {
      return val;
    }

    if (this.languageImpl.hasCase) {
      params.case = params.case || this.languageImpl.defaultCase;
    }

    // we do not always need genderOwned: only in some situations
    // typically when generating a substantive (plural), we don't need it
    // if we request it anyway, we might end up with an exception when is not in dict
    if (params.det || params.adj || params.possessiveAdj || params.represents) {
      params.genderOwned = this.genderNumberManager.getRefGender(val, params);
    }

    // get the number of the *owneD* thing, not the ownerR
    // 'number': can be null, or S P, or point to an object
    params.numberOwned = this.genderNumberManager.getRefNumber(null, params) || 'S';

    // does all the job for adjectives, before and after
    const adjBeforeAndAfter = this.getAdjBeforeAndAfter(val, params);

    const valSubst: string = this.languageImpl.getSubstantive(val, params.numberOwned, params.case);

    let possessiveAdj = '';
    if (params.possessiveAdj) {
      possessiveAdj = this.adjectiveManager.getAgreeAdj(params.possessiveAdj, val, params);
    }

    const everythingAfterDet = this.languageImpl.getFormattedNominalGroup(
      possessiveAdj,
      adjBeforeAndAfter.before,
      valSubst,
      adjBeforeAndAfter.after,
    );

    // we have to generate the det at the end: in Spanish we need to know what follows the det
    let det = '';
    if (params && params.det) {
      const paramsForDet: DetParams = {
        genderOwned: params.genderOwned,
        numberOwned: params.numberOwned,
        genderOwner: params.genderOwner,
        numberOwner: params.numberOwner,
        personOwner: params.personOwner,
        case: params.case,
        dist: params.dist,
        after: everythingAfterDet.trim(), // spaces from adding adjectives
        useTheWhenPlural: params.useTheWhenPlural,
        adjectiveAfterDet: adjBeforeAndAfter.before !== '',
        forceDes: params.FORCE_DES,
      };
      det = this.languageImpl.getDet(params.det, paramsForDet); // can return ''
      // console.log(`${JSON.stringify(paramsForDet)} => ${det}`);
    }
    return !!det ? det + this.helper.getSeparatingSpace() + everythingAfterDet : everythingAfterDet;
  }

  private valueObject(obj: any, params: ValueParams): void {
    //- we already have the next one
    if (this.refsManager.getNextRef(obj)) {
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

  private valueRefexpr(obj: ObjWithRefs, params: ValueParams): void {
    // is only called when obj.refexpr has a value
    obj.refexpr(obj, params);
  }

  private valueRef(obj: ObjWithRefs, params: any): void {
    //- printObj('value_ref', obj)
    if (obj.ref) {
      obj.ref(obj, params);
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${JSON.stringify(obj)} has no ref mixin`;
      throw err;
    }
    this.refsManager.setTriggeredRef(obj);
  }

  private valueNumberAsIs(val: number): string {
    return this.helper.protectString(val.toString());
  }

  private valueNumberFormat(val: number, params: ValueParams): string {
    return this.helper.protectString(this.languageImpl.getFormatNumberWithNumeral(val, params.FORMAT));
  }

  private getGenderFromParams(params: ValueParams): Genders {
    return params.agree != null ? this.genderNumberManager.getRefGender(params.agree, params) : 'M';
  }

  private valueNumberTextual(val: number, params: ValueParams): string {
    // only used for some languages
    const gender = this.getGenderFromParams(params);
    return this.languageImpl.getTextualNumber(val, gender);
  }

  private valueNumberOrdinalNumber(val: number, params: ValueParams): string {
    // only used for some languages
    const gender = this.getGenderFromParams(params);
    return this.helper.protectString(this.languageImpl.getOrdinalNumber(val, gender));
  }

  private valueNumberOrdinalTextual(val: number, params: ValueParams): string {
    if (val % 1 != 0) {
      // is not int
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `ORDINAL_TEXTUAL must be an integer, here ${val}`;
      throw err;
    }
    // currently used only for it_IT, es_ES, fr_FR
    const gender = params.agree != null ? this.genderNumberManager.getRefGender(params.agree, params) : 'M';
    return this.languageImpl.getOrdinal(val, gender);
  }

  private valueNumber(val: number, params: ValueParams): string {
    if (this.saveRollbackManager.isEvaluatingEmpty) {
      return 'SOME_NUMBER';
    } else {
      if (params) {
        if (params.AS_IS) {
          return this.valueNumberAsIs(val);
        } else if (params.FORMAT) {
          return this.valueNumberFormat(val, params);
        } else if (params.TEXTUAL) {
          return this.valueNumberTextual(val, params);
        } else if (params.ORDINAL_NUMBER) {
          return this.valueNumberOrdinalNumber(val, params);
        } else if (params.ORDINAL_TEXTUAL) {
          return this.valueNumberOrdinalTextual(val, params);
        }
      }
      return this.helper.protectString(this.languageImpl.getStdFormatedNumber(val));
    }
  }
}
