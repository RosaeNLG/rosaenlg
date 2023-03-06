/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Genders, Numbers } from './NlgLib';
import { LanguageImpl } from './LanguageImpl';

interface Anon {
  isAnonymous: true;
}

export type RefGenderMap = Map<any, Genders>;
export type RefNumberMap = Map<any, Numbers>;

export interface WithGender {
  gender?: Genders;
  genderOwned?: Genders;
}
export interface WithNumber {
  number?: Numbers;
  numberOwned?: Numbers;
}

export class GenderNumberManager {
  private languageImpl: LanguageImpl;
  private refGenderMap: RefGenderMap;
  private refNumberMap: RefNumberMap;

  public constructor(languageImpl: LanguageImpl) {
    this.languageImpl = languageImpl;
    this.refNumberMap = new Map();
    this.refGenderMap = new Map();
  }
  public getRefGenderMap(): RefGenderMap {
    return this.refGenderMap;
  }
  public setRefGenderMap(refGenderMap: RefGenderMap): void {
    this.refGenderMap = refGenderMap;
  }
  public getRefNumberMap(): RefNumberMap {
    return this.refNumberMap;
  }
  public setRefNumberMap(refNumberMap: RefNumberMap): void {
    this.refNumberMap = refNumberMap;
  }

  private isEmptyObj(obj: any): boolean {
    if (!obj) return true;
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  public setRefGenderNumber(obj: any, gender: Genders, number: Numbers): void {
    if (this.isEmptyObj(obj)) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGenderNumber obj should not be empty';
      throw err;
    }
    if (gender) {
      this.setRefGender(obj, gender, null);
    }
    if (number) {
      this.setRefNumber(obj, number);
    }
  }

  public setRefGender(obj: any, genderOrWord: string, params: any): void {
    if (this.isEmptyObj(obj)) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGender obj should not be empty';
      throw err;
    }
    let explicitGender: Genders;
    if (params && params.gender) {
      explicitGender = params.gender;
    }
    if (['M', 'F', 'N'].indexOf(genderOrWord) > -1) {
      explicitGender = genderOrWord as Genders;
    }

    if (explicitGender) {
      if (explicitGender != 'M' && explicitGender != 'F' && !this.languageImpl.hasNeutral) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invalid neutral gender in ${this.languageImpl.iso2}`;
        throw err;
      }
      this.refGenderMap.set(obj, explicitGender);
    } else if (genderOrWord) {
      // is a word
      const gender = this.getWordGender(genderOrWord);
      this.refGenderMap.set(obj, gender);
    } else {
      // called with null for instance
      // do nothing
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `setRefGender called on ${JSON.stringify(obj)} with invalid genderOrWord ${genderOrWord}`;
      throw err;
    }
  }

  public getRefGender(obj: any, params: WithGender): Genders {
    const inMainMap: Genders = this.refGenderMap.get(obj);
    if (inMainMap) {
      return inMainMap;
    } else if (typeof obj === 'string') {
      if (params) {
        if (params.gender) {
          return params.gender;
        }
        if (this.languageImpl.userGenderOwnedForGender && params.genderOwned) {
          return params.genderOwned;
        }
      }

      if (this.languageImpl.hasGender) {
        // we try to get the gender and throw an exception if not found
        return this.getWordGender(obj);
      } else {
        // we don't care
        return null;
      }
    }

    return null;
  }

  public getAnonymous(gender: Genders, number: Numbers): Anon {
    const obj: Anon = { isAnonymous: true };
    this.setRefGenderNumber(obj, gender, number);
    return obj;
  }

  public getAnonMS(): Anon {
    return this.getAnonymous('M', 'S');
  }
  public getAnonMP(): Anon {
    return this.getAnonymous('M', 'P');
  }
  public getAnonFS(): Anon {
    return this.getAnonymous('F', 'S');
  }
  public getAnonFP(): Anon {
    return this.getAnonymous('F', 'P');
  }

  private getNumberFromObj(obj: any): Numbers {
    if (typeof obj === 'string') {
      if (obj === 'S' || obj === 'P') {
        return obj;
      } else {
        return null;
      }
    } else {
      return this.refNumberMap.get(obj);
    }
  }

  public getRefNumber(obj: any, params: WithNumber): Numbers {
    // numberOwned > number > obj
    if (params) {
      if (params.numberOwned) {
        return this.getNumberFromObj(params.numberOwned);
      } else if (params.number) {
        return this.getNumberFromObj(params.number);
      }
    }

    if (obj != null) {
      return this.getNumberFromObj(obj);
    }
    return null;
  }

  public setRefNumber(obj: any, number: Numbers): void {
    if (this.isEmptyObj(obj)) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefNumber obj should not be empty';
      throw err;
    }
    if (number != 'S' && number != 'P') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `number must be S or P! - here is ${number}`;
      throw err;
    }
    this.refNumberMap.set(obj, number);
  }

  private getWordGender(word: string): Genders {
    return this.languageImpl.getWordGender(word);
  }
}
