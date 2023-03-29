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
  // PARTICIPLE
  'PARTICIPLE_PRESENT',
  'PARTICIPLE_PAST',
];

export type Person = 0 | 1 | 2 | 3 | 4 | 5;

const modals = ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would', 'ought'];

// same as in { EnglishGerunds } from 'english-verbs-gerunds'
interface EnglishGerunds {
  [inf: string]: string;
}

// same as in { EnglishVerbsIrregular } from 'english-verbs-irregular';
interface EnglishVerbsIrregular {
  [key: string]: EnglishVerbIrregular;
}
declare type EnglishVerbIrregular = string[][];

// what we need here: both merged
export interface VerbsInfo {
  [key: string]: VerbInfo;
}
export type VerbInfo = string[];

export interface ExtraParams {
  GOING_TO?: boolean;
  WILL?: boolean;
  NEGATIVE?: boolean;
  CONTRACT?: boolean;
  NO_DO?: boolean;
}

// helpers
export function mergeVerbsData(irregularsInfo: EnglishVerbsIrregular, gerundsInfo: EnglishGerunds): VerbsInfo {
  const res: VerbsInfo = {};

  // gerunds
  if (gerundsInfo) {
    const gerundKeys = Object.keys(gerundsInfo);
    for (const gerundKey of gerundKeys) {
      const gerundVal = gerundsInfo[gerundKey];
      res[gerundKey] = [null, null, gerundVal];
    }
  }

  // irregulars
  if (irregularsInfo) {
    const irregularKeys = Object.keys(irregularsInfo);
    for (const irregularKey of irregularKeys) {
      const irregularVal = irregularsInfo[irregularKey];

      if (!res[irregularKey]) {
        res[irregularKey] = [irregularVal[0][0], irregularVal[0][1], null];
      } else {
        res[irregularKey] = [irregularVal[0][0], irregularVal[0][1], res[irregularKey][2]];
      }
    }
  }

  return res;
}

function getIrregularHelper(verbsInfo: VerbsInfo, verb: string, index: number): string {
  const verbInfo = getVerbInfo(verbsInfo, verb);
  if (verbInfo && verbInfo.length != 0) {
    return verbInfo[index];
  } else {
    return null;
  }
}

function getCommonEdPart(verb: string): string {
  if (verb.endsWith('ie') || verb.endsWith('ee')) {
    return verb + 'd';
  } else if (yWithVowel(verb)) {
    // vowel + y: play -> played
    return verb + 'ed';
  } else if (verb.endsWith('y')) {
    // no vowel + y: cry -> cried
    return verb.substring(0, verb.length - 1) + 'ied';
  } else if (verb.endsWith('e')) {
    return verb + 'd';
  } else {
    return verb + 'ed';
  }
}

function getPastPart(verbsInfo: VerbsInfo, verb: string): string {
  if (verb === 'be') {
    return 'been';
  } else {
    const irregular = getIrregularHelper(verbsInfo, verb, 1);
    if (irregular) {
      return irregular;
    } else {
      return getCommonEdPart(verb);
    }
  }
}

function getPreteritPart(verbsInfo: VerbsInfo, verb: string, person: Person): string {
  let irregular: string;
  if (verb === 'be') {
    if (person === 0 || person === 2) {
      return 'was';
    } else {
      return 'were';
    }
  } else if ((irregular = getIrregularHelper(verbsInfo, verb, 0))) {
    return irregular;
  } else {
    return getCommonEdPart(verb);
  }
}

export function getIngPart(verbsInfo: VerbsInfo, verb: string): string {
  const consonants = 'bcdfghjklmnpqrstvxzw';
  const irregular = getIrregularHelper(verbsInfo, verb, 2);
  if (irregular) {
    return irregular;
  } else if (verb.match(new RegExp(`[${consonants}]e$`, 'g')) && verb != 'be' && verb != 'singe') {
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

function getSimplePast(verbsInfo: VerbsInfo, verb: string, person: Person): string {
  return getPreteritPart(verbsInfo, verb, person);
}

function yWithVowel(verb: string): boolean {
  return verb.match(/[aeiouy]y$/) !== null;
}

function getSimplePresentHeShe(verb: string): string {
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
  } else if (yWithVowel(verb)) {
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

function getSimplePresent(verb: string, person: Person): string {
  if (person != 2) {
    if (verb === 'be') {
      if (person === 0) {
        return 'am';
      } else {
        return 'are';
      }
    } else {
      return verb;
    }
  } else {
    return getSimplePresentHeShe(verb);
  }
}

function getSimpleFuture(verb: string, person: Person, isGoingTo: boolean, negative: boolean): string {
  if (isGoingTo) {
    return getSimplePresent('be', person) + ' ' + getNegative(negative) + 'going to ' + verb;
  } else {
    return 'will ' + getNegative(negative) + verb;
  }
}

function getNegative(negative: boolean): string {
  return negative ? 'not ' : '';
}

function getProgressivePast(verbsInfo: VerbsInfo, verb: string, person: Person, negative: boolean): string {
  return getPreteritPart(verbsInfo, 'be', person) + ' ' + getNegative(negative) + getIngPart(verbsInfo, verb);
}

function getProgressivePresent(verbsInfo: VerbsInfo, verb: string, person: Person, negative: boolean): string {
  return getSimplePresent('be', person) + ' ' + getNegative(negative) + getIngPart(verbsInfo, verb);
}

function getProgressiveFuture(verbsInfo: VerbsInfo, verb: string, negative: boolean): string {
  return 'will ' + getNegative(negative) + 'be ' + getIngPart(verbsInfo, verb);
}

function getPerfectPast(verbsInfo: VerbsInfo, verb: string, negative: boolean): string {
  return 'had ' + getNegative(negative) + getPastPart(verbsInfo, verb);
}

function getPerfectPresent(verbsInfo: VerbsInfo, verb: string, person: Person, negative: boolean): string {
  return getSimplePresent('have', person) + ' ' + getNegative(negative) + getPastPart(verbsInfo, verb);
}

function getPerfectFuture(verbsInfo: VerbsInfo, verb: string, negative: boolean): string {
  return 'will ' + getNegative(negative) + 'have ' + getPastPart(verbsInfo, verb);
}

function getPerfectProgressivePast(verbsInfo: VerbsInfo, verb: string, negative: boolean): string {
  return 'had ' + getNegative(negative) + 'been ' + getIngPart(verbsInfo, verb);
}

function getPerfectProgressivePresent(verbsInfo: VerbsInfo, verb: string, person: Person, negative: boolean): string {
  return getSimplePresent('have', person) + ' ' + getNegative(negative) + 'been ' + getIngPart(verbsInfo, verb);
}

function getPerfectProgressiveFuture(verbsInfo: VerbsInfo, verb: string, negative: boolean): string {
  return 'will ' + getNegative(negative) + 'have been ' + getIngPart(verbsInfo, verb);
}

function doContract(original: string): string {
  const contractions = [
    // present
    ['does not', "doesn't"],
    ['do not', "don't"],
    ['is not', "isn't"],
    ['are not', "aren't"],
    ['has not', "hasn't"],
    ['have not', "haven't"],
    ['can not', "can't"],
    ['could not', "couldn't"],
    ['may not', "mayn't"],
    ['might not', "mightn't"],
    ['will not', "won't"],
    ['shall not', "shan't"],
    ['would not', "wouldn't"],
    ['should not', "shouldn't"],
    ['must not', "mustn't"],
    ['ought not', "oughtn't"],
    // past
    ['did not', "didn't"],
    ['was not', "wasn't"],
    ['were not', "weren't"],
    ['had not', "hadn't"],
  ];

  for (const contraction of contractions) {
    const replaced = original.replace(contraction[0], contraction[1]);
    if (replaced !== original) {
      // finding one in fine, then we stop
      return replaced;
    }
  }
  // istanbul ignore next
  return original;
}

function getConjugatedVerb(
  verbsInfo: VerbsInfo,
  verb: string,
  tense: string,
  person: Person,
  isNegative: boolean,
  isHaveNoDo: boolean,
  isGoingTo: boolean,
): string {
  switch (tense) {
    case 'PAST':
    case 'SIMPLE_PAST':
      if (isNegative) {
        if (verb === 'be' || verb === 'do' || modals.indexOf(verb) > -1 || isHaveNoDo) {
          return getSimplePast(verbsInfo, verb, person) + ' not';
        } else {
          // 'do ...' form
          return getSimplePast(verbsInfo, 'do', person) + ' not ' + verb;
        }
      } else {
        return getSimplePast(verbsInfo, verb, person);
      }
    case 'PRESENT':
    case 'SIMPLE_PRESENT':
      if (isNegative) {
        if (verb === 'be' || verb === 'do' || modals.indexOf(verb) > -1 || isHaveNoDo) {
          return getSimplePresent(verb, person) + ' not';
        } else {
          // 'do ...' form
          return getSimplePresent('do', person) + ' not ' + verb;
        }
      } else {
        return getSimplePresent(verb, person);
      }
    case 'FUTURE':
    case 'SIMPLE_FUTURE':
      return getSimpleFuture(verb, person, isGoingTo, isNegative);
    case 'PROGRESSIVE_PAST':
      return getProgressivePast(verbsInfo, verb, person, isNegative);
    case 'PROGRESSIVE_PRESENT':
      return getProgressivePresent(verbsInfo, verb, person, isNegative);
    case 'PROGRESSIVE_FUTURE':
      return getProgressiveFuture(verbsInfo, verb, isNegative);
    case 'PERFECT_PAST':
      return getPerfectPast(verbsInfo, verb, isNegative);
    case 'PERFECT_PRESENT':
      return getPerfectPresent(verbsInfo, verb, person, isNegative);
    case 'PERFECT_FUTURE':
      return getPerfectFuture(verbsInfo, verb, isNegative);
    case 'PERFECT_PROGRESSIVE_PAST':
      return getPerfectProgressivePast(verbsInfo, verb, isNegative);
    case 'PERFECT_PROGRESSIVE_PRESENT':
      return getPerfectProgressivePresent(verbsInfo, verb, person, isNegative);
    case 'PERFECT_PROGRESSIVE_FUTURE':
      return getPerfectProgressiveFuture(verbsInfo, verb, isNegative);
    case 'PARTICIPLE_PRESENT':
      return (isNegative ? 'not ' : '') + getIngPart(verbsInfo, verb);
    case 'PARTICIPLE_PAST':
      return (isNegative ? 'not ' : '') + getPastPart(verbsInfo, verb);
  }
}

export function getConjugation(
  verbsInfo: VerbsInfo,
  verb: string,
  tense: string,
  person: Person,
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
  if ([0, 1, 2, 3, 4, 5].indexOf(person) === -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'person must be 0 1 2 3 4 or 5';
    throw err;
  }

  const isGoingTo = extraParams && extraParams.GOING_TO;
  const isNegative = extraParams && extraParams.NEGATIVE;
  const isHaveNoDo = isNegative && verb === 'have' && extraParams.NO_DO;

  const conjugated = getConjugatedVerb(verbsInfo, verb, tense, person, isNegative, isHaveNoDo, isGoingTo);

  if (isNegative && (extraParams.CONTRACT || isHaveNoDo)) {
    // Note that in the form without the auxiliary verb DO, the verb HAVE is always contracted with the adverb not.
    return doContract(conjugated);
  } else {
    return conjugated;
  }
}
