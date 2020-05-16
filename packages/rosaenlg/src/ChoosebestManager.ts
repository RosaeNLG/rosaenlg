import { RandomManager } from './RandomManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { scoreAlternative, DebugHolder } from 'synonym-optimizer';
import { Languages } from './NlgLib';

export interface CompleteDebug {
  maxTest: number;
  perfectScoreAfter: number;
  bestScore: number;
  bestText: string;
  bestDebug: DebugHolder;
  worstScore: number;
  worstText: string;
  worstDebug: DebugHolder;
}

export class ChoosebestManager {
  private language: Languages;
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private defaultAmong: number;
  private spy: Spy;

  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  public constructor(
    language: Languages,
    saveRollbackManager: SaveRollbackManager,
    randomManager: RandomManager,
    defaultAmong: number,
  ) {
    this.language = language;
    this.saveRollbackManager = saveRollbackManager;
    this.randomManager = randomManager;
    this.defaultAmong = defaultAmong;
  }

  public runChoosebest(
    which: string,
    params: {
      among: number;
      debug: boolean;
      debugRes: CompleteDebug;
      stop_words_add: string[];
      stop_words_remove: string[];
      stop_words_override: string[];
    },
  ): void {
    if (this.spy.isEvaluatingChoosebest()) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `choosebest cannot be imbricated`;
      throw err;
    }

    const debugOn = params && params.debug ? true : false;
    if (debugOn) {
      params.debugRes = {
        maxTest: null,
        perfectScoreAfter: null,
        bestScore: null,
        bestText: null,
        bestDebug: null,
        worstScore: null,
        worstText: null,
        worstDebug: null,
      };
    }

    let maxTest;
    if (params && params.among) {
      maxTest = params.among;
    } else {
      maxTest = this.defaultAmong;
    }

    if (debugOn) {
      params.debugRes.maxTest = maxTest;
    }

    function getFromParamsAndStoreDebug(paramName: string): any {
      const res: any = params && params[paramName] ? params[paramName] : null;
      if (debugOn && res) {
        params.debugRes[paramName] = res;
      }
      return res;
    }
    const stopWordsAdd: string[] = getFromParamsAndStoreDebug('stop_words_add');
    const stopWordsRemove: string[] = getFromParamsAndStoreDebug('stop_words_remove');
    const stopWordsOverride: string[] = getFromParamsAndStoreDebug('stop_words_override');
    const identicals: string[][] = getFromParamsAndStoreDebug('identicals');

    const newContentStart: number = this.spy.getPugHtml().length;

    // SIMULATE

    const scores: number[] = [];

    let alternatives: string[];
    let debugInfos: DebugHolder[];
    if (debugOn) {
      alternatives = [];
      debugInfos = [];
    }

    for (let i = 0; i < maxTest; i++) {
      // SAVE
      this.saveRollbackManager.saveSituation('choosebest');

      this.randomManager.incrRnd(i);

      this.spy.getPugMixins()[which](params);
      const generated: string = this.spy.getPugHtml().substring(newContentStart);

      // ROLLBACK
      this.saveRollbackManager.rollback();

      if (debugOn) {
        alternatives.push(generated);
      }

      const debugInfo = {
        filteredAlt: null,
        identicals: null,
        identicalsMap: null,
        wordsWithPos: null,
        score: null,
      };

      const score = scoreAlternative(
        this.language,
        generated,
        stopWordsAdd,
        stopWordsRemove,
        stopWordsOverride,
        identicals,
        debugOn ? debugInfo : null,
      );

      scores.push(score);

      if (debugOn) {
        debugInfos.push(debugInfo);
      }

      // console.log(`${generated} => ${score}`);

      // we can stop before if we ever get a perfect score
      if (score === 0) {
        if (debugOn) {
          params.debugRes.perfectScoreAfter = i;
        }
        break;
      }
    }

    // CHOOSE BEST
    const best = scores.indexOf(Math.min(...scores));

    if (debugOn) {
      params.debugRes.bestScore = scores[best];
      params.debugRes.bestText = alternatives[best];
      params.debugRes.bestDebug = debugInfos[best];
    }

    if (debugOn) {
      const worst = scores.indexOf(Math.max(...scores));
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
