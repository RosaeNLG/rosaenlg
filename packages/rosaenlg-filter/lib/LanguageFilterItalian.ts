/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageFilter } from './LanguageFilter';
import { LanguageCommonItalian } from 'rosaenlg-commons';

export class LanguageFilterItalian extends LanguageFilter {
  cleanSpacesPunctuationDoDefault = true;
  public languageCommon: LanguageCommonItalian;

  private getRegex(part: string): RegExp {
    return new RegExp(
      `${this.constants.stdBeforeWithParenthesis}(${part})${this.constants.stdBetweenWithParenthesis}([${this.constants.tousCaracteresMinMajRe}]*)`,
      'g',
    );
  }

  private getElt(before: string, determiner: string, capRef: string, between: string, word: string): string {
    return `${before}${this.getDetElt(determiner, capRef, between)}${word}`;
  }

  private getDetElt(determiner: string, capRef: string, between: string): string {
    const isUc = capRef.substring(0, 1).toLowerCase() != capRef.substring(0, 1);
    const newDet = isUc ? determiner.substring(0, 1).toUpperCase() + determiner.substring(1) : determiner;
    const newBetween = determiner.endsWith("'") ? between.replace(/ /g, '') : between.replace(/\s+/g, ' ');
    return `${newDet}${newBetween}`;
  }

  contractions(input: string): string {
    let res = input;

    // definite masc sing
    {
      res = res.replace(this.getRegex('[Ii]l|[Ll]o'), (_match, before, determiner, between, word): string => {
        if (this.languageCommon.isConsonneImpure(word) || this.languageCommon.isIFollowedByVowel(word)) {
          return this.getElt(before, 'lo', determiner, between, word);
        } else if (this.languageCommon.startsWithVowel(word)) {
          return this.getElt(before, "l'", determiner, between, word);
        } else {
          return this.getElt(before, 'il', determiner, between, word);
        }
      });
    }

    // definite masc plural
    {
      res = res.replace(this.getRegex('[Ii]|[Gg]li'), (_match, before, determiner, between, word): string => {
        if (
          this.languageCommon.isConsonneImpure(word) ||
          this.languageCommon.startsWithVowel(word) ||
          word.toLowerCase() === 'dei'
        ) {
          return this.getElt(before, 'gli', determiner, between, word);
        } else {
          return this.getElt(before, 'i', determiner, between, word);
        }
      });
    }

    // definite fem sing
    {
      res = res.replace(this.getRegex('[Ll]a'), (_match, before, determiner, between, word): string => {
        if (this.languageCommon.startsWithVowel(word) && !this.languageCommon.isIFollowedByVowel(word)) {
          return this.getElt(before, "l'", determiner, between, word);
        } else {
          return this.getElt(before, 'la', determiner, between, word);
        }
      });
    }

    // definite fem plural
    // nothing to do

    // indefinite masc
    {
      res = res.replace(this.getRegex('[Uu]n|[Uu]no'), (_match, before, determiner, between, word): string => {
        if (this.languageCommon.isConsonneImpure(word) || this.languageCommon.isIFollowedByVowel(word)) {
          return this.getElt(before, 'uno', determiner, between, word);
        } else {
          return this.getElt(before, 'un', determiner, between, word);
        }
      });
    }

    // indefinite fem
    {
      res = res.replace(this.getRegex('[Uu]na'), (_match, before, determiner, between, word): string => {
        if (this.languageCommon.startsWithVowel(word) && !this.languageCommon.isIFollowedByVowel(word)) {
          return this.getElt(before, "un'", determiner, between, word);
        } else {
          return this.getElt(before, 'una', determiner, between, word);
        }
      });
    }

    return res;
  }
}
