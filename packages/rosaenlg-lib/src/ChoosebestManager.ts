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
  maxTest: number | null;
  perfectScoreAfter: number | null;
  bestScore: number | null;
  bestText: string | null;
  bestDebug: DebugHolder | null;
  worstScore: number | null;
  worstText: string | null;
  worstDebug: DebugHolder | null;
  stop_words_add?: string[];
  stop_words_remove?: string[];
  stop_words_override?: string[];
  identicals?: string[][];
}

type MixinFct = (elt: any, extraParams?: any) => void;

export class ChoosebestManager {
  private language: Languages;
  private helper: Helper;
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private defaultAmong: number;
  private spy: SpyI | null = null;
  private synOptimizer: SynOptimizer;

  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }
  private getSpy(): SpyI {
    return this.spy as SpyI;
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

    const regexHtml = /<(\/?)([a-zA-Z1-9_-]+).*?>/g; // same as in html.ts from rosaenlg-filter - update accordingly
    res = res.replace(regexHtml, ' ');

    res = res.replace(/[¤\s]+/g, ' ');

    return res;
  }

  public runChoosebest(
    which: MixinFct,
    params: {
      among?: number;
      debug?: boolean;
      debugRes?: CompleteDebug; // not given as an input. Created as an output when debug is true
      stop_words_add?: string[];
      stop_words_remove?: string[];
      stop_words_override?: string[];
      identicals?: string[][];
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
      (params.debugRes as CompleteDebug).maxTest = maxTest;
    }

    if (debugOn) {
      (params.debugRes as CompleteDebug).stop_words_add = params?.stop_words_add;
      (params.debugRes as CompleteDebug).stop_words_remove = params?.stop_words_remove;
      (params.debugRes as CompleteDebug).stop_words_override = params?.stop_words_override;
      (params.debugRes as CompleteDebug).identicals = params?.identicals;
    }

    const newContentStart: number = this.getSpy().getPugHtml().length;

    // SIMULATE

    const scores: number[] = [];

    const alternatives: string[] = [];
    const debugInfos: DebugHolder[] = [];

    for (let i = 0; i < maxTest; i++) {
      // SAVE
      this.saveRollbackManager.saveSituation('choosebest');

      this.randomManager.incrRnd(i);

      which(params);
      const generatedOriginal: string = this.helper.getHtmlWithoutRenderDebug(
        this.getSpy().getPugHtml().substring(newContentStart),
      );

      const generated = this.cleanupStringBeforeChooseBest(generatedOriginal);

      // ROLLBACK
      this.saveRollbackManager.rollback();

      if (debugOn) {
        alternatives.push(generated);
      }

      const debugInfo: DebugHolder = {
        filteredAlt: null,
        identicals: null,
        identicalsMap: null,
        wordsWithPos: null,
        score: null,
      };

      const score = this.synOptimizer.scoreAlternative(
        generated,
        params?.stop_words_add,
        params?.stop_words_remove,
        params?.stop_words_override,
        params?.identicals,
        debugOn ? debugInfo : null,
      );

      scores.push(score);

      if (debugOn) {
        debugInfos.push(debugInfo);
      }

      // we can stop before if we ever get a perfect score
      if (score === 0) {
        if (debugOn) {
          (params.debugRes as CompleteDebug).perfectScoreAfter = i;
        }
        break;
      }
    }

    // CHOOSE BEST
    const best = scores.indexOf(Math.min(...scores));

    if (debugOn) {
      (params.debugRes as CompleteDebug).bestScore = scores[best];
      (params.debugRes as CompleteDebug).bestText = alternatives[best];
      (params.debugRes as CompleteDebug).bestDebug = debugInfos[best];

      const worst = scores.indexOf(Math.max(...scores));
      (params.debugRes as CompleteDebug).worstScore = scores[worst];
      (params.debugRes as CompleteDebug).worstText = alternatives[worst];
      (params.debugRes as CompleteDebug).worstDebug = debugInfos[worst];
    }

    // CHANGE RANDOM POSITION
    this.randomManager.incrRnd(best);

    // AND GENERATE IT
    which(params);
  }
}
