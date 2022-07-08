/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageFilter } from './LanguageFilter';
import { getAAn } from 'english-a-an';
import { AAnAsObj } from 'english-a-an-list';
import anList from 'english-a-an-list/dist/aan.json';
import titleCaseEnUs from 'better-title-case';

export class LanguageFilterEnglish extends LanguageFilter {
  cleanSpacesPunctuationDoDefault = true;

  protectRawNumbers(input: string): string {
    let res = input;
    const regexNumber = new RegExp(
      `([^\\d])${this.constants.stdBeforeWithParenthesis}((\\d{1,3}(?:\\,\\d{3})*|(?:\\d+))(?:\\.\\d+)?)`,
      'g',
    );
    res = res.replace(regexNumber, (_match, before1, before2, content): string => {
      return before1 + before2 + '§' + content + '§';
    });
    return res;
  }

  beforeProtect(input: string): string {
    let res = input;
    res = this.aAnGeneric(res, true);
    res = this.enPossessivesBeforeProtect(res);
    return res;
  }

  justBeforeUnprotect(input: string): string {
    let res = input;
    res = this.aAnGeneric(res, false);
    res = this.enPossessives(res);
    return res;
  }

  private enPossessives(input: string): string {
    let res = input;
    // the <b>earrings</b> 's size => The <b>earrings</b>' size
    const regexSS = new RegExp("s([☞☜\\s]*)'s([^" + this.constants.tousCaracteresMinMajRe + '])', 'g');
    res = res.replace(regexSS, (_match, between, after): string => {
      return `s${between}'${after}`;
    });
    return res;
  }

  private enPossessivesBeforeProtect(input: string): string {
    let res = input;
    const regexSS = new RegExp("(s\\s*§[\\s¤]*'s)([^" + this.constants.tousCaracteresMinMajRe + '])', 'g');
    res = res.replace(regexSS, (_corresp, _first, second): string => {
      return `s§' ${second}`;
    });
    return res;
  }

  private aAnGeneric(input: string, beforeProtect: boolean): string {
    let res = input;
    const regexA = new RegExp(
      `([^${this.constants.tousCaracteresMinMajRe}])([aA])${
        this.constants.stdBetweenWithParenthesis
      }(${this.constants.getInBetween(beforeProtect)})([${this.constants.tousCaracteresMinMajRe}]*)`,
      'g',
    );
    res = res.replace(regexA, (match, before, aA, between, beforeWord, word): string => {
      if (word != null && word != '') {
        // can be null when orphan "a" at the very end of a text
        const newAa = this.redoCapitalization(
          aA,
          getAAn(this.dictManager.getAdjsWordsData(), anList as AAnAsObj, word),
        );
        return `${before}${newAa}${between}${beforeWord}${word}`;
      } else {
        return match;
      }
    });
    return res;
  }

  private redoCapitalization(initial: string, replacement: string): string {
    if (initial === 'A') {
      return replacement.substring(0, 1).toUpperCase() + replacement.substring(1); // A or An...
    } else {
      return replacement;
    }
  }

  titlecase(input: string): string {
    return titleCaseEnUs(input);
  }

  cleanSpacesPunctuationCorrect(input: string): string {
    let res = input;

    // ['the phone \'s', 'The phone\'s'],
    res = res.replace(/\s*'/g, "'");

    return res;
  }
}
