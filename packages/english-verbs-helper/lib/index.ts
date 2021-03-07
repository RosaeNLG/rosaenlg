/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

// https://learningenglish.voanews.com/a/introduction-to-verb-tenses-everyday-grammar/3123576.html

const tenses = [
  // SIMPLE
  'SIMPLE_PAST',
  'PAST',
  'SIMPLE_PRESENT',
  'PRESENT',
  'SIMPLE_FUTURE',
  'FUTURE',
  // PROGRESSIVE
  'PROGRESSIVE_PAST',
  'PROGRESSIVE_PRESENT',
  'PROGRESSIVE_FUTURE',
  // PERFECT
  'PERFECT_PAST',
  'PERFECT_PRESENT',
  'PERFECT_FUTURE',
  // PERFECT PROGRESSIVE
  'PERFECT_PROGRESSIVE_PAST',
  'PERFECT_PROGRESSIVE_PRESENT',
  'PERFECT_PROGRESSIVE_FUTURE',
];
export type Numbers = 'S' | 'P';

const modals = ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'];

// from english-verbs-gerund
export interface GerundsInfo {
  [key: string]: string;
}

// from english-verbs-irregular
export interface VerbsIrregularInfo {
  [key: string]: VerbIrregularInfo;
}
export type VerbIrregularInfo = string[][];

// what we need here: both merged
export interface VerbsInfo {
  [key: string]: VerbInfo;
}
export type VerbInfo = string[];

export interface ExtraParams {
  GOING_TO?: boolean;
  WILL?: boolean;
}

// helpers
export function mergeVerbsData(irregularsInfo: VerbsIrregularInfo, gerundsInfo: GerundsInfo): VerbsInfo {
  const res: VerbsInfo = {};

  // gerunds
  if (gerundsInfo) {
    const gerundKeys = Object.keys(gerundsInfo);
    for (let i = 0; i < gerundKeys.length; i++) {
      const gerundKey = gerundKeys[i];
      const gerundVal = gerundsInfo[gerundKey];
      res[gerundKey] = [null, null, gerundVal];
    }
  }

  // irregulars
  if (irregularsInfo) {
    const irregularKeys = Object.keys(irregularsInfo);
    for (let i = 0; i < irregularKeys.length; i++) {
      const irregularKey = irregularKeys[i];
      const irregularVal = irregularsInfo[irregularKey];
      /*
    if (irregularVal.length > 1) {
      console.log(
        `WARNING: multiple conjugations for ${irregularKey}: ${JSON.stringify(
          irregularVal,
        )} - will always take the first one`,
      );
    }
    */
      if (!res[irregularKey]) {
        res[irregularKey] = [irregularVal[0][0], irregularVal[0][1], null];
      } else {
        res[irregularKey] = [irregularVal[0][0], irregularVal[0][1], res[irregularKey][2]];
      }
    }
  }

  return res;
}

function getIrregularHelper(verbInfo: VerbInfo, index: number): string {
  if (verbInfo && verbInfo.length != 0) {
    return verbInfo[index];
  } else {
    return null;
  }
}

function getPastPart(verbInfo: VerbInfo, verb: string): string {
  let irregular: string;
  if (verb === 'be') {
    return 'been';
  } else if ((irregular = getIrregularHelper(verbInfo, 1))) {
    return irregular;
  } else {
    return verb + 'ed';
  }
}

function getPreteritPart(verbInfo: VerbInfo, verb: string, number: Numbers): string {
  let irregular: string;
  if (verb === 'be') {
    if (number === 'P') {
      return 'were';
    } else {
      return 'was';
    }
  } else if ((irregular = getIrregularHelper(verbInfo, 0))) {
    return irregular;
  } else {
    return verb + 'ed';
  }
}

export function getIngPart(verbInfo: VerbInfo, verb: string): string {
  const consonants = 'bcdfghjklmnpqrstvxzw';
  let irregular: string;
  if ((irregular = getIrregularHelper(verbInfo, 2))) {
    return irregular;
  } else if (verb.match(new RegExp(`[${consonants}]e$`, 'g')) && verb != 'be') {
    // If  the  infinitive  ends  with  a  consonant followed by an –e,
    // you have to take off the –e to form your present participle.
    // this is not in the english-verbs-gerunds list
    // hum and unless it is 'to be'! which becomes being, not bing.
    return verb.substring(0, verb.length - 1) + 'ing';
  } else {
    return verb + 'ing';
  }
}

/* does not throw an exception: 
most verb conjugation is rule based, thus not finding it in the resource is not a problem */
export function getVerbInfo(verbsInfo: VerbsInfo, verb: string): VerbInfo {
  return verbsInfo ? verbsInfo[verb] : null;
}

// 1 per tense

function getSimplePast(verbInfo: VerbInfo, verb: string, number: Numbers): string {
  return getPreteritPart(verbInfo, verb, number);
}

function getSimplePresent(verb: string, number: Numbers): string {
  if (number === 'P') {
    if (verb === 'be') {
      return 'are';
    } else {
      return verb;
    }
  } else {
    if (modals.indexOf(verb) > -1) {
      return verb;
    } else if (verb === 'have') {
      return 'has';
    } else if (verb === 'be') {
      return 'is';
    } else if (verb === 'do') {
      return 'does';
    } else if (verb === 'go') {
      return 'goes';
    } else if (verb.match(/[aeiouy]y$/)) {
      // vowel + y: play -> plays
      return verb + 's';
    } else if (verb.endsWith('y')) {
      // no vowel + y: fly -> flies
      return verb.substring(0, verb.length - 1) + 'ies';
    } else if (verb.endsWith('ss') || verb.endsWith('x') || verb.endsWith('sh') || verb.endsWith('ch')) {
      return verb + 'es';
    } else {
      // default
      return verb + 's';
    }
  }
}

function getSimpleFuture(verb: string, number: Numbers, extraParams: ExtraParams): string {
  if (extraParams && extraParams.GOING_TO) {
    if (number === 'P') {
      return 'are going to ' + verb;
    } else {
      return 'is going to ' + verb;
    }
  } else {
    // default is will
    return 'will ' + verb;
  }
}

function getProgressivePast(gerund: string, number: Numbers): string {
  return (number === 'P' ? 'were ' : 'was ') + gerund;
}

function getProgressivePresent(gerund: string, number: Numbers): string {
  return (number === 'P' ? 'are ' : 'is ') + gerund;
}

function getProgressiveFuture(gerund: string): string {
  return 'will be ' + gerund;
}

function getPerfectPast(pastPart: string): string {
  return 'had ' + pastPart;
}

function getPerfectPresent(number: Numbers, pastPart: string): string {
  return (number === 'P' ? 'have ' : 'has ') + pastPart;
}

function getPerfectFuture(pastPart: string): string {
  return 'will have ' + pastPart;
}

function getPerfectProgressivePast(gerund: string): string {
  return 'had been ' + gerund;
}

function getPerfectProgressivePresent(gerund: string, number: Numbers): string {
  return (number === 'P' ? 'have ' : 'has ') + 'been ' + gerund;
}

function getPerfectProgressiveFuture(gerund: string): string {
  return 'will have been ' + gerund;
}

export function getConjugation(
  verbsInfo: VerbsInfo,
  verb: string,
  tense: string,
  number: Numbers,
  extraParams: ExtraParams,
): string {
  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }
  if (tenses.indexOf(tense) == -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `invalid tense: ${tense}`;
    throw err;
  }
  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'number must be S or P';
    throw err;
  }

  switch (tense) {
    case 'PAST':
    case 'SIMPLE_PAST':
      return getSimplePast(getVerbInfo(verbsInfo, verb), verb, number);
    case 'PRESENT':
    case 'SIMPLE_PRESENT':
      return getSimplePresent(verb, number);
    case 'FUTURE':
    case 'SIMPLE_FUTURE':
      return getSimpleFuture(verb, number, extraParams);
    case 'PROGRESSIVE_PAST':
      return getProgressivePast(getIngPart(getVerbInfo(verbsInfo, verb), verb), number);
    case 'PROGRESSIVE_PRESENT':
      return getProgressivePresent(getIngPart(getVerbInfo(verbsInfo, verb), verb), number);
    case 'PROGRESSIVE_FUTURE':
      return getProgressiveFuture(getIngPart(getVerbInfo(verbsInfo, verb), verb));
    case 'PERFECT_PAST':
      return getPerfectPast(getPastPart(getVerbInfo(verbsInfo, verb), verb));
    case 'PERFECT_PRESENT':
      return getPerfectPresent(number, getPastPart(getVerbInfo(verbsInfo, verb), verb));
    case 'PERFECT_FUTURE':
      return getPerfectFuture(getPastPart(getVerbInfo(verbsInfo, verb), verb));
    case 'PERFECT_PROGRESSIVE_PAST':
      return getPerfectProgressivePast(getIngPart(getVerbInfo(verbsInfo, verb), verb));
    case 'PERFECT_PROGRESSIVE_PRESENT':
      return getPerfectProgressivePresent(getIngPart(getVerbInfo(verbsInfo, verb), verb), number);
    case 'PERFECT_PROGRESSIVE_FUTURE':
      return getPerfectProgressiveFuture(getIngPart(getVerbInfo(verbsInfo, verb), verb));
  }
}
