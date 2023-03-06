/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { RandomManager } from './RandomManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { SynOptimizer, DebugHolder } from 'synonym-optimizer';
import { Languages } from './NlgLib';
import { Helper } from './Helper';
import { SpyI } from './Spy';

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

type MixinFct = (elt: any, extraParams?: any) => void;

export class ChoosebestManager {
  private language: Languages;
  private helper: Helper;
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private defaultAmong: number;
  private spy: SpyI;
  private synOptimizer: SynOptimizer;

  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }

  public constructor(
    language: Languages,
    helper: Helper,
    saveRollbackManager: SaveRollbackManager,
    randomManager: RandomManager,
    defaultAmong: number,
  ) {
    this.language = language;
    this.helper = helper;
    this.saveRollbackManager = saveRollbackManager;
    this.randomManager = randomManager;
    this.defaultAmong = defaultAmong;
    this.synOptimizer = new SynOptimizer(language);
  }

  private cleanupStringBeforeChooseBest(original: string): string {
    /*
        do some cleanup:
        - ¤
        - html tags, including <protect>...</protect>
        (<span class="rosaenlg-debug" id="...">...<\/span> is already done)
      */
    let res = original;

    const regexHtml = new RegExp('<(/?)([a-zA-Z1-9_-]+).*?>', 'g'); // same as in html.ts from rosaenlg-filter - update accordingly
    res = res.replace(regexHtml, ' ');

    res = res.replace(/[¤\s]+/g, ' ');

    return res;
  }

  public runChoosebest(
    which: MixinFct,
    params: {
      among: number;
      debug: boolean;
      debugRes: CompleteDebug;
      stop_words_add: string[];
      stop_words_remove: string[];
      stop_words_override: string[];
    },
  ): void {
    if (this.saveRollbackManager.isEvaluatingChoosebest) {
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

    let maxTest: number;
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

      which(params);
      const generatedOriginal: string = this.helper.getHtmlWithoutRenderDebug(
        this.spy.getPugHtml().substring(newContentStart),
      );

      const generated = this.cleanupStringBeforeChooseBest(generatedOriginal);

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

      const score = this.synOptimizer.scoreAlternative(
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
    which(params);
  }
}
