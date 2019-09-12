import { RandomManager } from './RandomManager';
import { SaveRollbackManager } from './SaveRollbackManager';

//import * as Debug from "debug";
//const debug = Debug("rosaenlg");

export type SynoSeq = Map<string, number>;
export type SynoMode = 'sequence' | 'random';

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

  public constructor(
    randomManager: RandomManager,
    saveRollbackManager: SaveRollbackManager,
    defaultSynoMode: SynoMode,
  ) {
    this.randomManager = randomManager;
    this.saveRollbackManager = saveRollbackManager;
    this.defaultSynoMode = defaultSynoMode;

    this.synoSeq = new Map();
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

    // first call
    const exclude: number[] = excludeParam || [];

    const synoMode: string = params.mode || this.defaultSynoMode;

    let toTest: number;

    switch (synoMode) {
      case 'sequence': {
        toTest = this.getNextSeqNotIn(which, size, exclude);
        break;
      }
      case 'random': {
        // we force and it has not been excluded yet
        if (params.force && exclude.length === 0) {
          toTest = params.force;
        } else {
          toTest = this.randomManager.randomNotIn(size, params, exclude);
        }
        break;
      }
    }

    if (toTest) {
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

        if (synoMode === 'sequence') {
          this.synoSeq.set(which, toTest);
        }

        // and don't continue
      }
    }
  }
}
