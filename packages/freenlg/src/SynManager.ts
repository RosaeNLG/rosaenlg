import { RandomManager } from "./RandomManager";
import { SaveRollbackManager } from "./SaveRollbackManager";

export class SynManager {
  saveRollbackManager: SaveRollbackManager;
  randomManager: RandomManager;
  synoSeq: Map<string, number>;
  defaultSynoMode: string;
  spy: Spy;

  constructor(params: any) {
    this.saveRollbackManager = params.saveRollbackManager;
  
    this.randomManager = params.randomManager;
  
    this.synoSeq = new Map();
    this.defaultSynoMode = params.defaultSynoMode;
  }
  


  getNextSeqNotIn(which: string, size: number, exclude: Array<number>): number {
    //console.log('are excluded: ' + JSON.stringify(exclude));
    
    let lastRecorded: number = this.synoSeq.get(which);
    let last: number = lastRecorded!=null ? lastRecorded : 0;

    function getNext(last: number): number {
      return last >= size ? 1 : last+1;
    }

    let logicalNext: number = getNext(last);
    while (exclude.indexOf(logicalNext)>-1) {
      logicalNext = getNext(logicalNext);
    }

    //console.log(last + ' will try ' + logicalNext);
    return logicalNext;
  }


  synFct(items: Array<any>): any {
    return items[Math.floor(this.randomManager.getNextRnd() * items.length)];
  }


  simpleSyn(items: Array<any>): void {
    if (this.spy.isEvaluatingEmpty()) {
      this.spy.appendPugHtml(' SOME_SYN ');
    } else {
      let chosen: any = this.synFct(items);
      this.spy.getPugMixins().insertVal(chosen);
    }
  }

  runSynz(which: string, size: number, params: any, excludeParam: Array<number>) {

    //console.log(params);

    // first call
    let exclude: Array<number> = excludeParam || [];

    let synoMode: string = params.mode || this.defaultSynoMode;

    let toTest: number;

    if (synoMode=='sequence') {
      //console.log("SEQUENCE");

      toTest = this.getNextSeqNotIn(which, size, exclude);

    } else if (synoMode=='random') {
      // we force and it has not been excluded yet
      if (params.force!=null && exclude.length==0) {
        toTest = params.force;
      } else {
        toTest = this.randomManager.randomNotIn(size, params, exclude);
      }
    }

    if (toTest!=null) { // just stop if nothing new is found

      // console.log("to test: " + which + ' ' + toTest);
      this.saveRollbackManager.saveSituation({context:'isEmpty'});
      let html_before: string = this.spy.getPugHtml();

      try {
        this.spy.getPugMixins()[which](toTest, params);
      } catch (e) {
        /* istanbul ignore next */
        throw e;
      }

      //console.log("before: <" + html_before + ">");
      //console.log("after: <" + pug_html + ">");
      if (html_before==this.spy.getPugHtml()) {
        //console.log("exclude: " + toTest);
        exclude.push(toTest);        
        this.saveRollbackManager.rollback();
        // continue
        this.runSynz(which, size, params, exclude);
      } else {
        // console.log("diff: <" + pug_html.substring(html_before.length) + ">");
        //util.deleteRollback();

        // rollback and do it for real
        // pug_html = html_before;
        this.saveRollbackManager.rollback();

        // add spaces before and after
        this.spy.appendPugHtml(" ");
        this.spy.getPugMixins()[which](toTest, params);
        this.spy.appendPugHtml(" ");

        if (synoMode=='sequence') {
          this.synoSeq.set(which, toTest);
        }

        // and don't continue
      }
    }
  }
}




