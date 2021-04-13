/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnglishPluralsList } from 'english-plurals-list';

const dontChange: string[] = [
  'sheep',
  'fish',
  'deer',
  'moose',
  'series',
  'species',
  'money',
  'rice',
  'information',
  'equipment',
  'bison',
  'cod',
  'offspring',
  'pike',
  'salmon',
  'shrimp',
  'swine',
  'trout',
  'aircraft',
  'hovercraft',
  'spacecraft',
  'sugar',
  'tuna',
  'you',
  'wood',
];

const otherExceptions = {
  woman: 'women',
  person: 'people',
  bus: 'buses',
  alga: 'algae',
};

export interface WordInfo {
  plural: string;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}

const consonants = 'bcdfghjklmnpqrstvxzw';

export function getPlural(wordsInfo: WordsInfo, irregulars: EnglishPluralsList, singular: string): string {
  if (!singular) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'singular word is mandatory';
    throw err;
  }

  if (wordsInfo && wordsInfo[singular] && wordsInfo[singular].plural) {
    return wordsInfo[singular].plural;
  } else if (dontChange.indexOf(singular) > -1) {
    return singular;
  } else if (otherExceptions[singular]) {
    return otherExceptions[singular];
  } else if (irregulars && irregulars[singular]) {
    return irregulars[singular];
  } else if (
    singular.endsWith('s') ||
    singular.endsWith('ss') ||
    singular.endsWith('sh') ||
    singular.endsWith('ch') ||
    singular.endsWith('x') ||
    singular.endsWith('z')
  ) {
    return singular + 'es';
  } else if (singular.match(new RegExp(`[${consonants}]y$`, 'g'))) {
    return singular.substring(0, singular.length - 1) + 'ies';
  } else {
    return singular + 's';
  }
}
