/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { RandomManager } from './RandomManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { Helper } from './Helper';
import { SpyI } from './Spy';

export type SynoSeq = Map<string, number>;
export type SynoTriggered = Map<string, number[]>;
export type SynoMode = 'sequence' | 'random' | 'once';

interface RunSynzParams {
  force?: number;
  mode?: SynoMode;
}

export interface SynManagerParams {
  defaultSynoMode: SynoMode;
}

interface ToTest {
  index: number;
  exclude: number[];
}

type MixinFct = (elt: any, extraParams?: any) => void;

export class SynManager {
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private defaultSynoMode: SynoMode;
  private spy: SpyI;
  private synoSeq: SynoSeq;
  private synoTriggered: SynoTriggered;
  private helper: Helper;

  public constructor(
    randomManager: RandomManager,
    saveRollbackManager: SaveRollbackManager,
    helper: Helper,
    synManagerParams: SynManagerParams,
  ) {
    this.randomManager = randomManager;
    this.saveRollbackManager = saveRollbackManager;
    this.defaultSynoMode = synManagerParams.defaultSynoMode;
    this.helper = helper;

    this.synoSeq = new Map();
    this.synoTriggered = new Map();
  }
  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }
  public getSynoSeq(): SynoSeq {
    return this.synoSeq;
  }
  public setSynoSeq(synoSeq: SynoSeq): void {
    this.synoSeq = synoSeq;
  }
  public getSynoTriggered(): SynoTriggered {
    return this.synoTriggered;
  }
  public setSynoTriggered(synoTriggered: SynoTriggered): void {
    this.synoTriggered = synoTriggered;
  }
  private getSynoTriggeredOn(which: string): number[] {
    return this.synoTriggered.get(which) || [];
  }

  private getNextSeqNotIn(whichName: string, size: number, exclude: number[]): number {
    const lastRecorded: number = this.synoSeq.get(whichName);

    function getNext(last: number): number {
      return last >= size ? 1 : last + 1;
    }

    let logicalNext: number = getNext(lastRecorded ? lastRecorded : 0);
    while (exclude.indexOf(logicalNext) > -1) {
      logicalNext = getNext(logicalNext);
    }

    return logicalNext;
  }

  public synFct(items: any[]): any {
    if (items.length == 1) {
      return items[0];
    } else {
      return items[Math.floor(this.randomManager.getNextRnd() * items.length)];
    }
  }

  public synFctHelper(items: any[] | any): any {
    if (Array.isArray(items)) {
      // choose one in the array
      return this.synFct(items);
    } else {
      return items;
    }
  }

  public simpleSyn(items: any[]): void {
    /*
      DO NOT check this.saveRollbackManager.isEvaluatingEmpty
      synFct MUST be triggered properly to update random numbers properly
    */
    const chosen = this.synFct(items);
    this.helper.insertValEscaped(chosen);
  }

  private getToTest(
    synoMode: SynoMode,
    which: MixinFct,
    whichName: string,
    size: number,
    params: RunSynzParams,
    excludeParam: number[],
  ): ToTest {
    switch (synoMode) {
      case 'sequence':
        return { index: this.getNextSeqNotIn(whichName, size, excludeParam), exclude: excludeParam };
      case 'once': {
        // we try
        const toTest = this.randomManager.randomNotIn(size, params, excludeParam);
        if (toTest) {
          return { index: toTest, exclude: excludeParam };
        } else {
          // nothing new is found

          // we set as potentially valid those who were triggered
          const triggered: number[] = this.getSynoTriggeredOn(whichName);
          const newExclude = excludeParam.filter(function wasNotInTriggered(val: number): boolean {
            // true = keep the element; we exclude if it was not triggered
            return triggered.indexOf(val) == -1;
          });

          // and we reset triggered list
          // we try to avoid the last one that was triggered, when possible
          const triggeredNext = [];
          if (triggered.length > 1) {
            // more than 1 are non empty, so we can avoid
            const lastToAvoid = triggered[triggered.length - 1];
            triggeredNext.push(lastToAvoid);
            newExclude.push(lastToAvoid);
          }
          this.synoTriggered.set(whichName, triggeredNext);

          // and try again
          return { index: this.randomManager.randomNotIn(size, params, newExclude), exclude: newExclude };
        }
      }
      case 'random':
        return { index: this.randomManager.randomNotIn(size, params, excludeParam), exclude: excludeParam };
    }
  }

  // for some reason which.name does not work properly, thus we have whichName
  public runSynz(
    which: MixinFct,
    whichName: string,
    size: number,
    params: RunSynzParams,
    excludeParam: number[],
  ): void {
    const synoMode: SynoMode = params.mode || this.defaultSynoMode;
    if (['sequence', 'random', 'once'].indexOf(synoMode) === -1) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `invalid synonym mode: ${synoMode}`;
      throw err;
    }

    let exclude: number[] = excludeParam;
    let toTest: number;

    // first call
    if (!excludeParam) {
      exclude = [];

      if (synoMode === 'once') {
        const triggered: number[] = this.getSynoTriggeredOn(whichName);
        // we try to exclude all the ones that already were triggered
        exclude = exclude.concat(triggered);
      }

      // we force and it has not been excluded so we test it
      if (params.force) {
        toTest = params.force;
      }
    }

    if (toTest == null) {
      const toTestStruct = this.getToTest(synoMode, which, whichName, size, params, exclude);
      toTest = toTestStruct.index;
      exclude = toTestStruct.exclude;
    }

    if (toTest != null) {
      // just stop if nothing new is found

      this.saveRollbackManager.saveSituation('isEmpty');
      const htmlBefore: string = this.spy.getPugHtml();

      // can throw exception
      which(toTest, params);

      if (this.helper.htmlHasNotChanged(htmlBefore)) {
        exclude.push(toTest);
        this.saveRollbackManager.rollback();
        // continue
        this.runSynz(which, whichName, size, params, exclude);
      } else {
        // rollback and do it for real
        this.saveRollbackManager.rollback();

        // add spaces before and after
        this.helper.insertSeparatingSpaceIfRequired();
        which(toTest, params);
        this.helper.insertSeparatingSpaceIfRequired();

        switch (synoMode) {
          case 'random': {
            // nothing special
            break;
          }
          case 'sequence': {
            this.synoSeq.set(whichName, toTest);
            break;
          }
          case 'once': {
            const triggered = this.synoTriggered.get(whichName) || [];
            triggered.push(toTest);
            this.synoTriggered.set(whichName, triggered);
            break;
          }
        }

        // and don't continue
      }
    }
  }
}
