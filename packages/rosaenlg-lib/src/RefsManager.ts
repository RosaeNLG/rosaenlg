/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenderNumberManager } from './GenderNumberManager';
import { RandomManager } from './RandomManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { ValueManager } from './ValueManager';
import { SpyI } from './Spy';

import { Genders, Numbers } from './NlgLib';

export type RepresentantType = 'ref' | 'refexpr';
type Key = any;
export type TriggeredRefs = Map<Key, boolean>;
export type NextRefs = Map<Key, NextRef>;

export interface NextRef {
  valueForDebug: string;
  REPRESENTANT: RepresentantType;
  gender: Genders | undefined;
  number: Numbers | undefined;
  rndNextPos: number;
}

export type RefExprMixinFct = (elt: any, extraParams?: any) => void;
export interface ObjWithRefs {
  ref: RefExprMixinFct;
  refexpr?: RefExprMixinFct;
}

export class RefsManager {
  // could be replaced by a List? but maybe less efficient as we lookup in it
  private triggeredRefs: TriggeredRefs;
  private nextRefs: NextRefs;

  private saveRollbackManager: SaveRollbackManager;
  private genderNumberManager: GenderNumberManager;
  private randomManager: RandomManager;
  private valueManager: ValueManager | undefined = undefined;
  private spy: SpyI | undefined = undefined;

  public constructor(
    saveRollbackManager: SaveRollbackManager,
    genderNumberManager: GenderNumberManager,
    randomManager: RandomManager,
  ) {
    this.saveRollbackManager = saveRollbackManager;
    this.genderNumberManager = genderNumberManager;
    this.randomManager = randomManager;

    this.triggeredRefs = new Map();
    this.nextRefs = new Map();
  }

  public setValueManager(valueManager: ValueManager): void {
    this.valueManager = valueManager;
  }
  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }
  protected getSpy(): SpyI {
    return this.spy as SpyI;
  }
  public getNextRefs(): NextRefs {
    return this.nextRefs;
  }
  public setNextRefs(nextRefs: NextRefs): void {
    this.nextRefs = nextRefs;
  }
  public getTriggeredRefs(): TriggeredRefs {
    return this.triggeredRefs;
  }
  public setTriggeredRefs(triggeredRefs: TriggeredRefs): void {
    this.triggeredRefs = triggeredRefs;
  }

  public getNextRef(obj: ObjWithRefs): NextRef | undefined {
    return this.nextRefs.get(this.getKey(obj));
  }
  private setNextRef(obj: ObjWithRefs, nextRef: NextRef): void {
    this.nextRefs.set(this.getKey(obj), nextRef);
  }

  public getNextRep(obj: ObjWithRefs, params: any): NextRef {
    if (!obj) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `getNextRep called on null object`;
      throw err;
    }

    // there's already one planned
    if (this.getNextRef(obj) !== undefined) {
      return this.getNextRef(obj) as NextRef;
    }

    // simulate
    const rndNextPosBefore: number = this.randomManager.getRndNextPos();
    this.saveRollbackManager.saveSituation('nextRep');
    const hadRefBefore: boolean = this.hasTriggeredRef(obj);
    const lengthBefore: number = this.getSpy().getPugHtml().length;

    // cross dependency prevents from calling the function directly
    (this.valueManager as ValueManager).value(obj, params);

    // record the result before rollback

    const nextRef: NextRef = {
      valueForDebug: this.getSpy().getPugHtml().substring(lengthBefore),
      // we don't care about what will be triggered, but only if it has been triggered before
      REPRESENTANT: hadRefBefore ? 'refexpr' : 'ref',
      gender: this.genderNumberManager.getRefGender(obj, null),
      number: this.genderNumberManager.getRefNumber(obj, null),
      rndNextPos: rndNextPosBefore,
    };

    // rollback
    this.saveRollbackManager.rollback();

    // register the result
    this.genderNumberManager.setRefGenderNumber(nextRef, nextRef.gender, nextRef.number);

    // save the nextRef for use when it will actually be triggered
    this.setNextRef(obj, nextRef);

    return nextRef;
  }

  private getKey(obj: ObjWithRefs): Key {
    return obj;
  }

  public resetRep(obj: ObjWithRefs): void {
    this.triggeredRefs.delete(this.getKey(obj));
    // if we had asked for a next ref
    this.nextRefs.delete(this.getKey(obj));
  }

  public hasTriggeredRef(obj: ObjWithRefs): boolean {
    return this.triggeredRefs.get(this.getKey(obj)) ? true : false;
  }

  public setTriggeredRef(obj: ObjWithRefs): void {
    this.triggeredRefs.set(this.getKey(obj), true);
  }

  public deleteNextRef(obj: ObjWithRefs): void {
    this.nextRefs.delete(this.getKey(obj));
  }
}
