/**
 * @license
 * Copyright 2020 Ludan Stoecklé, 2015 Martin Eneqvist <marlun78@hotmail.com> (https://github.com/marlun78)
 * SPDX-License-Identifier: MIT
 */

// only import the exact file required (other it creates a huge browser bundle)
import n2words from '../../rosaenlg-n2words/dist/n2words_EN.js';

/*
  more than largely inspired from https://github.com/marlun78/number-to-cardinal/blob/master/src/makeOrdinal.js
  thanks to Martin Eneqvist the author
*/
const ENDS_WITH_DOUBLE_ZERO_PATTERN = /(hundred|thousand|(m|b|tr|quadr)illion)$/;
const ENDS_WITH_TEEN_PATTERN = /teen$/;
const ENDS_WITH_Y_PATTERN = /y$/;
const ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/;
const ordinalLessThanThirteen = {
  zero: 'zeroth',
  one: 'first',
  two: 'second',
  three: 'third',
  four: 'fourth',
  five: 'fifth',
  six: 'sixth',
  seven: 'seventh',
  eight: 'eighth',
  nine: 'ninth',
  ten: 'tenth',
  eleven: 'eleventh',
  twelve: 'twelfth',
};

export function getOrdinal(val: number): string | undefined {
  const cardinal = n2words(val, { lang: 'en' });

  // Ends with *00 (100, 1000, etc.) or *teen (13, 14, 15, 16, 17, 18, 19)
  if (ENDS_WITH_DOUBLE_ZERO_PATTERN.test(cardinal) || ENDS_WITH_TEEN_PATTERN.test(cardinal)) {
    return cardinal + 'th';
  }
  // Ends with *y (20, 30, 40, 50, 60, 70, 80, 90)
  else if (ENDS_WITH_Y_PATTERN.test(cardinal)) {
    return cardinal.replace(ENDS_WITH_Y_PATTERN, 'ieth');
  } /* istanbul ignore next */
  // Ends with one through twelve
  else if (ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN.test(cardinal)) {
    return cardinal.replace(ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN, (_match: string, numberWord: string): string => {
      // 'as' due to TypeScript 5
      return ordinalLessThanThirteen[
        numberWord as
          | 'zero'
          | 'one'
          | 'two'
          | 'three'
          | 'four'
          | 'five'
          | 'six'
          | 'seven'
          | 'eight'
          | 'nine'
          | 'ten'
          | 'eleven'
          | 'twelve'
      ] as string;
    });
  } /* istanbul ignore next */ else {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `cannot make ordinal from ${cardinal}`;
  }
}
