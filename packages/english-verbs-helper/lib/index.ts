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
export type Numbers = 'S' | 'P';

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

function getPastPart(verbInfo: VerbInfo, verb: string): string {
  let irregular: string;
  if (verb === 'be') {
    return 'been';
  } else if ((irregular = getIrregularHelper(verbInfo, 1))) {
    return irregular;
  } else {
    return getCommonEdPart(verb);
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
    return getCommonEdPart(verb);
  }
}

export function getIngPart(verbInfo: VerbInfo, verb: string): string {
  const consonants = 'bcdfghjklmnpqrstvxzw';
  let irregular: string;
  if ((irregular = getIrregularHelper(verbInfo, 2))) {
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

function getSimplePast(verbInfo: VerbInfo, verb: string, number: Numbers): string {
  return getPreteritPart(verbInfo, verb, number);
}

function yWithVowel(verb): boolean {
  return verb.match(/[aeiouy]y$/);
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
}

function getSimpleFuture(verb: string, number: Numbers, extraParams: ExtraParams, negative: boolean): string {
  if (extraParams && extraParams.GOING_TO) {
    if (number === 'P') {
      return 'are ' + getNegative(negative) + 'going to ' + verb;
    } else {
      return 'is ' + getNegative(negative) + 'going to ' + verb;
    }
  } else {
    // default is will
    return 'will ' + getNegative(negative) + verb;
  }
}

function getNegative(negative: boolean): string {
  return negative ? 'not ' : '';
}

function getProgressivePast(gerund: string, number: Numbers, negative: boolean): string {
  return (number === 'P' ? 'were ' : 'was ') + getNegative(negative) + gerund;
}

function getProgressivePresent(gerund: string, number: Numbers, negative: boolean): string {
  return (number === 'P' ? 'are ' : 'is ') + getNegative(negative) + gerund;
}

function getProgressiveFuture(gerund: string, negative: boolean): string {
  return 'will ' + getNegative(negative) + 'be ' + gerund;
}

function getPerfectPast(pastPart: string, negative: boolean): string {
  return 'had ' + getNegative(negative) + pastPart;
}

function getPerfectPresent(number: Numbers, pastPart: string, negative: boolean): string {
  return (number === 'P' ? 'have ' : 'has ') + getNegative(negative) + pastPart;
}

function getPerfectFuture(pastPart: string, negative: boolean): string {
  return 'will ' + getNegative(negative) + 'have ' + pastPart;
}

function getPerfectProgressivePast(gerund: string, negative: boolean): string {
  return 'had ' + getNegative(negative) + 'been ' + gerund;
}

function getPerfectProgressivePresent(gerund: string, number: Numbers, negative: boolean): string {
  return (number === 'P' ? 'have ' : 'has ') + getNegative(negative) + 'been ' + gerund;
}

function getPerfectProgressiveFuture(gerund: string, negative: boolean): string {
  return 'will ' + getNegative(negative) + 'have been ' + gerund;
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

  const isNegative = extraParams && extraParams.NEGATIVE;
  const isHaveNoDo = extraParams && extraParams.NEGATIVE && verb === 'have' && extraParams.NO_DO;

  function addContract(original: string): string {
    let res = original;
    if (isNegative && (extraParams.CONTRACT || isHaveNoDo)) {
      // Note that in the form without the auxiliary verb DO, the verb HAVE is always contracted with the adverb not.
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
        res = res.replace(contraction[0], contraction[1]);
      }
    }
    return res;
  }

  switch (tense) {
    case 'PAST':
    case 'SIMPLE_PAST':
      if (isNegative) {
        if (verb === 'be' || verb === 'do' || modals.indexOf(verb) > -1 || isHaveNoDo) {
          return addContract(getSimplePast(getVerbInfo(verbsInfo, verb), verb, number) + ' not');
        } else {
          // 'do ...' form
          return addContract(getSimplePast(getVerbInfo(verbsInfo, 'do'), 'do', number) + ' not ' + verb);
        }
      } else {
        return getSimplePast(getVerbInfo(verbsInfo, verb), verb, number);
      }
    case 'PRESENT':
    case 'SIMPLE_PRESENT':
      if (isNegative) {
        if (verb === 'be' || verb === 'do' || modals.indexOf(verb) > -1 || isHaveNoDo) {
          return addContract(getSimplePresent(verb, number) + ' not');
        } else {
          // 'do ...' form
          return addContract(getSimplePresent('do', number) + ' not ' + verb);
        }
      } else {
        return getSimplePresent(verb, number);
      }
    case 'FUTURE':
    case 'SIMPLE_FUTURE':
      return addContract(getSimpleFuture(verb, number, extraParams, isNegative));
    case 'PROGRESSIVE_PAST':
      return addContract(getProgressivePast(getIngPart(getVerbInfo(verbsInfo, verb), verb), number, isNegative));
    case 'PROGRESSIVE_PRESENT':
      return addContract(getProgressivePresent(getIngPart(getVerbInfo(verbsInfo, verb), verb), number, isNegative));
    case 'PROGRESSIVE_FUTURE':
      return addContract(getProgressiveFuture(getIngPart(getVerbInfo(verbsInfo, verb), verb), isNegative));
    case 'PERFECT_PAST':
      return addContract(getPerfectPast(getPastPart(getVerbInfo(verbsInfo, verb), verb), isNegative));
    case 'PERFECT_PRESENT':
      return addContract(getPerfectPresent(number, getPastPart(getVerbInfo(verbsInfo, verb), verb), isNegative));
    case 'PERFECT_FUTURE':
      return addContract(getPerfectFuture(getPastPart(getVerbInfo(verbsInfo, verb), verb), isNegative));
    case 'PERFECT_PROGRESSIVE_PAST':
      return addContract(getPerfectProgressivePast(getIngPart(getVerbInfo(verbsInfo, verb), verb), isNegative));
    case 'PERFECT_PROGRESSIVE_PRESENT':
      return addContract(
        getPerfectProgressivePresent(getIngPart(getVerbInfo(verbsInfo, verb), verb), number, isNegative),
      );
    case 'PERFECT_PROGRESSIVE_FUTURE':
      return addContract(getPerfectProgressiveFuture(getIngPart(getVerbInfo(verbsInfo, verb), verb), isNegative));
    case 'PARTICIPLE_PRESENT':
      return getIngPart(getVerbInfo(verbsInfo, verb), verb);
    case 'PARTICIPLE_PAST':
      return getPastPart(getVerbInfo(verbsInfo, verb), verb);
  }
}
