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
export type TriggeredRefs = Map<string, boolean>;
export type NextRefs = Map<string, NextRef>;

export interface NextRef {
  valueForDebug: string;
  REPRESENTANT: RepresentantType;
  gender: Genders;
  number: Numbers;
  rndNextPos: number;
}

type RefExprMixinFct = (elt: any, extraParams?: any) => void;
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
  private valueManager: ValueManager;
  private spy: SpyI;

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

  public getNextRef(obj: ObjWithRefs): NextRef {
    return this.nextRefs.get(this.getKey(obj));
  }
  private setNextRef(obj: ObjWithRefs, nextRef: NextRef): void {
    this.nextRefs.set(this.getKey(obj), nextRef);
  }

  public getNextRep(obj: ObjWithRefs, params): NextRef {
    // there's already one planned
    if (this.getNextRef(obj)) {
      return this.getNextRef(obj);
    }

    if (!obj) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `getNextRep called on null object`;
      throw err;
    }

    // simulate
    const rndNextPosBefore: number = this.randomManager.getRndNextPos();
    this.saveRollbackManager.saveSituation('nextRep');
    const hadRefBefore: boolean = this.hasTriggeredRef(obj);
    const lengthBefore: number = this.spy.getPugHtml().length;

    // cross dependency prevents from calling the function directly
    this.valueManager.value(obj, params);

    // record the result before rollback

    const nextRef: NextRef = {
      valueForDebug: this.spy.getPugHtml().substring(lengthBefore),
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

  private getMixinNameInComment(fct: RefExprMixinFct): string {
    const lines = fct.toString().split('\n');
    /* istanbul ignore next */
    if (lines.length === 0) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `points to an empty mixin`;
      throw err;
    }
    const firstLine = lines[0];
    const matches = firstLine.match(/NAME_(.*)/);
    /* istanbul ignore next */
    if (matches.length < 2) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `could not resolve mixin name in the comment from compilation`;
      throw err;
    }
    const mixinName = matches[1];
    return mixinName;
  }

  private getKey(obj: ObjWithRefs): string {
    let key = 'REF:' + this.getMixinNameInComment(obj.ref);
    if (obj.refexpr) {
      key += '|REFEXPR:' + this.getMixinNameInComment(obj.refexpr);
    }
    return key;
  }

  public resetRep(obj: ObjWithRefs): void {
    this.triggeredRefs.delete(this.getKey(obj));
    // if we had asked for a next ref
    this.nextRefs.delete(this.getKey(obj));
  }

  public hasTriggeredRef(obj: ObjWithRefs): boolean {
    return this.triggeredRefs.get(this.getKey(obj));
  }

  public setTriggeredRef(obj: ObjWithRefs): void {
    this.triggeredRefs.set(this.getKey(obj), true);
  }

  public deleteNextRef(obj: ObjWithRefs): void {
    this.nextRefs.delete(this.getKey(obj));
  }
}
