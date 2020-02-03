export type EnglishTense = 'SIMPLE_PAST' | 'PAST' | 'SIMPLE_PRESENT' | 'PRESENT' | 'SIMPLE_FUTURE' | 'FUTURE';
const tenses = ['SIMPLE_PAST', 'PAST', 'SIMPLE_PRESENT', 'PRESENT', 'SIMPLE_FUTURE', 'FUTURE'];
export type Numbers = 'S' | 'P';

const modals = ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'];

export interface VerbsInfo {
  [key: string]: string[][];
}

export interface ExtraParams {
  GOING_TO?: boolean;
  WILL?: boolean;
}

// helpers

function getIrregularPreterit(verbsInfo: VerbsInfo, verb: string): string {
  if (verbsInfo && verbsInfo[verb] && verbsInfo[verb].length != 0) {
    const verbInfo = verbsInfo[verb];
    if (verbInfo.length > 1) {
      console.log(`WARNING: multiple conjugations for ${verb}: ${JSON.stringify(verbInfo)}`);
    }
    // console.log(verbInfo);
    return verbInfo[0][0];
  } else {
    return null;
  }
}

const consonants = 'bcdfghjklmnpqrstvxzw';
export function getIng(verb: string): string {
  if (verb.match(new RegExp(`[${consonants}]e$`, 'g'))) {
    // If  the  infinitive  ends  with  a  consonant followed by an –e,
    // you have to take off the –e to form your present participle.
    return verb.substring(0, verb.length - 1) + 'ing';
  } else if (verb.match(new RegExp(`[aeiou][${consonants}]$`, 'g'))) {
    // If  the  infinitive  ends  with one  vowel  followed  by  one  consonant(except  of –y),
    // you  have  to  double  this consonant to form your present participle.
    return verb + verb.charAt(verb.length - 1) + 'ing';
  } else if (verb.endsWith('ie')) {
    // If the infinitive ends with –ie,
    // the letters are replaced by –y followed by –ing in the past participle form.
    return verb.substring(0, verb.length - 2) + 'y' + 'ing';
  } else {
    return verb + 'ing';
  }
}

// 1 per tense

function getSimplePast(verbsInfo: VerbsInfo, verb: string, number: Numbers): string {
  let irregular: string;
  if (verb === 'be') {
    if (number === 'P') {
      return 'were';
    } else {
      return 'was';
    }
  } else if (verb === 'do') {
    return 'did';
  } else if (verb === 'have') {
    return 'had';
  } else if ((irregular = getIrregularPreterit(verbsInfo, verb))) {
    // is irregular, and we have info
    return irregular;
  } else {
    return verb + 'ed';
  }
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

export function getConjugation(
  verbsInfo: VerbsInfo,
  verb: string,
  tense: EnglishTense,
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
      return getSimplePast(verbsInfo, verb, number);
    case 'PRESENT':
    case 'SIMPLE_PRESENT':
      return getSimplePresent(verb, number);
    case 'FUTURE':
    case 'SIMPLE_FUTURE':
      return getSimpleFuture(verb, number, extraParams);
  }
}
