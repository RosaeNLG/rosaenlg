import { RandomManager } from "./RandomManager";
import { SaveRollbackManager } from "./SaveRollbackManager";
import { scoreAlternative } from "synonym-optimizer";

import * as Debug from "debug";
const debug = Debug("freenlg");

export class ChoosebestManager {
  language: 'en_US'|'de_DE'|'fr_FR';
  saveRollbackManager: SaveRollbackManager;
  randomManager: RandomManager;
  defaultAmong: number;
  spy: Spy;

  constructor(params: any) {
    this.saveRollbackManager = params.saveRollbackManager;  
    this.randomManager = params.randomManager;
    this.language = params.language;
    this.defaultAmong = params.defaultAmong;
  }
  

  runChoosebest(which:string, params:{
    among: number,
    debug: boolean,
    debugRes: any,
    stop_words_add: string[],
    stop_words_remove: string[],
    stop_words_override: string[]
  }) {

    if (this.spy.isEvaluatingChoosebest()) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `choosebest cannot be imbricated`;
      throw err;
    }

    const debugOn = params && params.debug ? true : false;
    if (debugOn) {
      params.debugRes = {};
    }

    let maxTest;
    if (params!=null && params.among!=null) {
      maxTest = params.among;
    } else {
      maxTest = this.defaultAmong;
    }

    if (debugOn) {
      params.debugRes.maxTest = maxTest;
    }

    function getFromParamsAndStoreDebug(paramName:string) {
      let res: any = params!=null && params[paramName]!=null ? params[paramName] : null;
      if (debugOn && res!=null) {
        params.debugRes[paramName] = res;
      }
      return res;
    }
    const stop_words_add: string[] = getFromParamsAndStoreDebug('stop_words_add');
    const stop_words_remove: string[] = getFromParamsAndStoreDebug('stop_words_remove');
    const stop_words_override: string[] = getFromParamsAndStoreDebug('stop_words_override');
    const identicals: string[][] = getFromParamsAndStoreDebug('identicals');

    let newContentStart: number = this.spy.getPugHtml().length;

    // SIMULATE

    let scores: number[] = [];
    
    let alternatives: string[];
    let debugInfos: any[];
    if (debugOn) {
      alternatives = [];
      debugInfos = [];
    }

    for (var i=0; i<maxTest; i++) {

      // SAVE
      this.saveRollbackManager.saveSituation('choosebest');

      this.randomManager.incrRnd(i);

      this.spy.getPugMixins()[which](params);
      let generated:string = this.spy.getPugHtml().substring(newContentStart);

      // ROLLBACK
      this.saveRollbackManager.rollback();

      if (debugOn) {
        alternatives.push(generated);
      }

      let debugInfo = {};
      
      let score = scoreAlternative(
        this.language, generated, 
        stop_words_add, stop_words_remove, stop_words_override, 
        identicals,
        debugOn ? debugInfo : null);

      scores.push(score);

      if (debugOn) {
        debugInfos.push(debugInfo);
      }

      // console.log(`${generated} => ${score}`);

      // we can stop before if we ever get a perfect score
      if (score==0) {
        if (debugOn) {
          params.debugRes.perfectScoreAfter = i;
        }
        break;
      }
    }

    // CHOOSE BEST
    let best = scores.indexOf( Math.min(...scores) );

    if (debugOn) {
      params.debugRes.bestScore = scores[best];
      params.debugRes.bestText = alternatives[best];
      params.debugRes.bestDebug = debugInfos[best];
    }

    if (debugOn) {
      let worst = scores.indexOf( Math.max(...scores) );
      params.debugRes.worstScore = scores[worst];
      params.debugRes.worstText = alternatives[worst];
      params.debugRes.worstDebug = debugInfos[worst];
    }

    // CHANGE RANDOM POSITION
    this.randomManager.incrRnd(best);

    // AND GENERATE IT
    this.spy.getPugMixins()[which](params);
  }


}

