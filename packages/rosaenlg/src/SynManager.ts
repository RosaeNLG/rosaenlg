/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { RandomManager } from './RandomManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { Helper } from './Helper';

export type SynoSeq = Map<string, number>;
export type SynoTriggered = Map<string, number[]>;
export type SynoMode = 'sequence' | 'random' | 'once';

interface RunSynzParams {
  force: number;
  mode: SynoMode;
}

export interface SynManagerParams {
  defaultSynoMode: SynoMode;
}

export class SynManager {
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private defaultSynoMode: SynoMode;
  private spy: Spy;
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
  public setSpy(spy: Spy): void {
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

  private getNextSeqNotIn(which: string, size: number, exclude: number[]): number {
    // console.log('are excluded: ' + JSON.stringify(exclude));

    const lastRecorded: number = this.synoSeq.get(which);

    function getNext(last: number): number {
      return last >= size ? 1 : last + 1;
    }

    let logicalNext: number = getNext(lastRecorded ? lastRecorded : 0);
    while (exclude.indexOf(logicalNext) > -1) {
      logicalNext = getNext(logicalNext);
    }

    // console.log(last + ' will try ' + logicalNext);
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
      DO NOT check this.spy.isEvaluatingEmpty()
      synFct MUST be triggered properly to update random numbers properly
    */
    const chosen = this.synFct(items);
    this.spy.getPugMixins().insertVal(chosen);
  }

  public runSynz(which: string, size: number, params: RunSynzParams, excludeParam: number[]): void {
    // console.log('runSynz', which);

    const synoMode: string = params.mode || this.defaultSynoMode;
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
        const triggered: number[] = this.getSynoTriggeredOn(which);
        //console.log(`first call. already triggered is ${triggered.join()}`);
        // we try to exclude all the ones that already were triggered
        exclude = exclude.concat(triggered);
      }

      // we force and it has not been excluded so we test it
      if (params.force) {
        toTest = params.force;
      }
    }

    if (toTest == null) {
      switch (synoMode) {
        case 'sequence': {
          toTest = this.getNextSeqNotIn(which, size, exclude);
          break;
        }
        case 'once': {
          // we try
          toTest = this.randomManager.randomNotIn(size, params, exclude);
          if (toTest == null) {
            // nothing new is found, so we should reset triggered list
            this.synoTriggered.set(which, []);
            // and we set as potentially valid those who were triggered
            const triggered: number[] = this.getSynoTriggeredOn(which);
            exclude = exclude.filter(function wasNotInTriggered(val: number): boolean {
              return triggered.indexOf(val) > -1;
            });
            // and try again
            toTest = this.randomManager.randomNotIn(size, params, exclude);
          }
          break;
        }
        case 'random': {
          toTest = this.randomManager.randomNotIn(size, params, exclude);
          break;
        }
      }
    }

    if (toTest != null) {
      // just stop if nothing new is found

      // console.log("to test: " + which + ' ' + toTest);
      this.saveRollbackManager.saveSituation('isEmpty');
      const htmlBefore: string = this.spy.getPugHtml();

      // can throw exception
      this.spy.getPugMixins()[which](toTest, params);

      // console.log('before: <' + htmlBefore + '>');
      // console.log('after:  <' + this.spy.getPugHtml() + '>');

      if (this.helper.htmlHasNotChanged(htmlBefore)) {
        // console.log("exclude: " + toTest);
        exclude.push(toTest);
        this.saveRollbackManager.rollback();
        // continue
        this.runSynz(which, size, params, exclude);
      } else {
        // console.log("diff: <" + this.spy.getPugHtml().substring(htmlBefore.length) + ">");

        // rollback and do it for real
        this.saveRollbackManager.rollback();

        // add spaces before and after
        this.spy.appendPugHtml('¤');
        this.spy.getPugMixins()[which](toTest, params);
        this.spy.appendPugHtml('¤');

        switch (synoMode) {
          case 'random': {
            // nothing special
            break;
          }
          case 'sequence': {
            this.synoSeq.set(which, toTest);
            break;
          }
          case 'once': {
            // this.printSynoTriggered();
            const triggered = this.synoTriggered.get(which) || [];
            // console.log(`already triggered list is ${triggered.join()}`);
            triggered.push(toTest);
            //console.log(`new triggered list is ${triggered.join()}`);
            this.synoTriggered.set(which, triggered);
            //this.printSynoTriggered();
            break;
          }
        }

        // and don't continue
      }
    }
  }
}
