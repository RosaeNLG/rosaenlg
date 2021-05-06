/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenderNumberManager } from './GenderNumberManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { SpyI } from './Spy';

export class Helper {
  private genderNumberManager: GenderNumberManager;
  private saveRollbackManager: SaveRollbackManager;
  private renderDebug: boolean;
  private spy: SpyI;

  public constructor(
    genderNumberManager: GenderNumberManager,
    saveRollbackManager: SaveRollbackManager,
    renderDebug: boolean,
  ) {
    this.genderNumberManager = genderNumberManager;
    this.saveRollbackManager = saveRollbackManager;
    this.renderDebug = renderDebug;
  }
  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }

  public appendDoubleSpace(): void {
    this.spy.appendPugHtml('  ');
  }

  public insertValEscaped(val: string): void {
    const escaped = val.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    this.spy.appendPugHtml('¤' + escaped + '¤');
  }
  public insertValUnescaped(val: string): void {
    this.spy.appendPugHtml('¤' + val + '¤');
  }

  public getSorP(table: string[], obj: any): string {
    if (!table || table.length < 2) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'you must provide a table with 2 elements: S + P';
      throw err;
    }

    const number = this.genderNumberManager.getRefNumber(obj, null);

    if (number === 'P') {
      return table[1];
    }
    // default: number===null || number==='S'
    return table[0];
  }

  public getMFN(table: string[], obj: any): string {
    const gender = this.genderNumberManager.getRefGender(obj, null);

    if (!table || table.length === 0) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `you must provide a table with elements MF(N)`;
      throw err;
    }

    if (gender === 'M') {
      return table[0];
    } else if (gender === 'F') {
      if (table.length < 2) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `${obj} is Feminine, you must provide a table with 2 elements MF`;
        throw err;
      }
      return table[1];
    } else if (gender === 'N') {
      if (table.length < 3) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `${obj} is Neutral, you must provide a table with 3 elements MFN`;
        throw err;
      }
      return table[2];
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `getMFN but ${JSON.stringify(obj)} has no gender`;
      throw err;
    }
  }

  public isSentenceStart(): boolean {
    /*
      .   xxxx
      .xxx
      do not work on inline

      > xxxx
      >xxx
      warning because not true on all tags: : </b> is not an end of sentence
    */
    if (/\.[\s|¤]*$/.test(this.spy.getPugHtml())) {
      return true;
    }
    if (/>[\s|¤]*$/.test(this.spy.getPugHtml())) {
      return true;
    }

    return false;
  }

  public getUppercaseWords(str: string): string {
    if (str && str.length > 0) {
      if (this.saveRollbackManager.isEvaluatingEmpty) {
        return 'SOME_WORDS';
      } else {
        return str.replace(/\b\w/g, function (l: string): string {
          return l.toUpperCase();
        });
      }
    }
  }

  public hasFlag(params: any, flag: string): boolean {
    if (this.getFlagValue(params, flag)) {
      return true;
    } else {
      return false;
    }
  }

  public getFlagValue(params: any, flag: string): any {
    if (params) {
      if (flag) {
        return params[flag];
      } else {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = 'getFlagValue flag value must not be null';
        throw err;
      }
    } else {
      return null;
    }
  }

  public protectString(str: string): string {
    return '§' + str + '§';
  }

  public getHtmlWithoutRenderDebug(originalHtml: string): string {
    // remove debug traces
    if (this.renderDebug) {
      // must be non greedy
      return originalHtml.replace(/<span class="rosaenlg-debug" id=".*?"><\/span>/g, '');
    } else {
      return originalHtml;
    }
  }

  public htmlHasNotChanged(htmlBefore: string): boolean {
    // what has been added?
    let trimmedAdded = this.spy.getPugHtml().substring(htmlBefore.length);

    trimmedAdded = this.getHtmlWithoutRenderDebug(trimmedAdded);

    // we must remove spaces and ¤ before comparing
    trimmedAdded = trimmedAdded.replace(/[\s|¤]/g, '');

    return trimmedAdded === '';
  }
}
