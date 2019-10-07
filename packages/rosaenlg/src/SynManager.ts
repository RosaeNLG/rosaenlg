import { RandomManager } from './RandomManager';
import { SaveRollbackManager } from './SaveRollbackManager';

//import * as Debug from "debug";
//const debug = Debug("rosaenlg");

export type SynoSeq = Map<string, number>;
export type SynoTriggered = Map<string, number[]>;
export type SynoMode = 'sequence' | 'random' | 'once';

interface RunSynzParams {
  force: number;
  mode: SynoMode;
  //[key: string]: any;
}

export class SynManager {
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private defaultSynoMode: SynoMode;
  private spy: Spy;
  private synoSeq: SynoSeq;
  private synoTriggered: SynoTriggered;

  public constructor(
    randomManager: RandomManager,
    saveRollbackManager: SaveRollbackManager,
    defaultSynoMode: SynoMode,
  ) {
    this.randomManager = randomManager;
    this.saveRollbackManager = saveRollbackManager;
    this.defaultSynoMode = defaultSynoMode;

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
  /*
  public printSynoTriggered(): void {
    for (const key of this.synoTriggered.keys()) {
      console.log(`${key} => ${this.synoTriggered.get(key).join()}`);
    }
  }
  */

  private getNextSeqNotIn(which: string, size: number, exclude: number[]): number {
    // debug('are excluded: ' + JSON.stringify(exclude));

    const lastRecorded: number = this.synoSeq.get(which);
    const last: number = lastRecorded ? lastRecorded : 0;

    function getNext(last: number): number {
      return last >= size ? 1 : last + 1;
    }

    let logicalNext: number = getNext(last);
    while (exclude.indexOf(logicalNext) > -1) {
      logicalNext = getNext(logicalNext);
    }

    // debug(last + ' will try ' + logicalNext);
    return logicalNext;
  }

  public synFct(items: any[]): any {
    return items[Math.floor(this.randomManager.getNextRnd() * items.length)];
  }

  public simpleSyn(items: any[]): void {
    if (this.spy.isEvaluatingEmpty()) {
      this.spy.appendPugHtml(' SOME_SYN ');
    } else {
      const chosen = this.synFct(items);
      this.spy.getPugMixins().insertVal(chosen);
    }
  }

  public runSynz(which: string, size: number, params: RunSynzParams, excludeParam: number[]): void {
    //console.log(params);
    // debug(params);

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

      // debug("to test: " + which + ' ' + toTest);
      this.saveRollbackManager.saveSituation('isEmpty');
      const htmlBefore: string = this.spy.getPugHtml();

      try {
        this.spy.getPugMixins()[which](toTest, params);
      } catch (e) {
        /* istanbul ignore next */
        throw e;
      }

      // debug("before: <" + htmlBefore + ">");
      // debug("after: <" + this.spy.getPugHtml() + ">");
      if (htmlBefore === this.spy.getPugHtml()) {
        // debug("exclude: " + toTest);
        exclude.push(toTest);
        this.saveRollbackManager.rollback();
        // continue
        this.runSynz(which, size, params, exclude);
      } else {
        // debug("diff: <" + this.spy.getPugHtml().substring(htmlBefore.length) + ">");
        //util.deleteRollback();

        // rollback and do it for real
        // pug_html = htmlBefore;
        this.saveRollbackManager.rollback();

        // add spaces before and after
        this.spy.appendPugHtml(' ');
        this.spy.getPugMixins()[which](toTest, params);
        this.spy.appendPugHtml(' ');

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
