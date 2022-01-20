/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon, DictManager, Constants } from 'rosaenlg-commons';

export abstract class LanguageFilter {
  languageForCommons: string;
  readonly cleanSpacesPunctuationDoDefault: boolean;

  public constants: Constants;
  public languageCommon: LanguageCommon;
  protected dictManager: DictManager;

  constructor(languageCommon: LanguageCommon) {
    this.languageCommon = languageCommon;
    this.dictManager = languageCommon.dictManager;
    this.constants = languageCommon.constants;
  }

  contractions(input: string): string {
    return input;
  }

  beforeProtect(input: string): string {
    return input;
  }

  justBeforeUnprotect(input: string): string {
    return input;
  }

  titlecase(_input: string): string {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `titlecase is not available for ${this.languageForCommons}`;
    throw err;
  }

  cleanSpacesPunctuation(input: string): string {
    return input;
  }

  // correct things, at the end of the cleaning spaces and punctuation process
  cleanSpacesPunctuationCorrect(input: string): string {
    return input;
  }

  addCapsSpecific(input: string): string {
    return input;
  }

  /*
  French: de + le => du
  Spanish: de + el => del
  */
  protected contract2elts(rawFirstPart: string, secondPart: string, replacer: string, input: string): string {
    // de => [d|D]e
    const firstPart = `[${rawFirstPart.substring(0, 1)}|${rawFirstPart
      .substring(0, 1)
      .toUpperCase()}]${rawFirstPart.substring(1)}`;

    const regexContr = new RegExp(
      `${this.constants.stdBeforeWithParenthesis}(${firstPart})${this.constants.stdBetweenWithParenthesis}${secondPart}${this.constants.stdBetweenWithParenthesis}`,
      'g',
    );

    /*
      something like:
      /([\s¤☛☚☞☜\.:!\?;,…])([à|À])([\s¤☞☜]+|$)lesquels([\s¤☞☜]+|$)/g
    */

    return input.replace(
      regexContr,
      function (match: string, before: string, part1: string, between: string, after: string): string {
        const isUc = part1.substring(0, 1).toLowerCase() != part1.substring(0, 1);
        const newDet = isUc ? replacer.substring(0, 1).toUpperCase() + replacer.substring(1) : replacer;
        return `${before}${newDet}${between}${after}`;
      },
    );
  }
}
