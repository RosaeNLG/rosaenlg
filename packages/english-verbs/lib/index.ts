export type EnglishTense = 'SIMPLE_PRESENT' | 'PRESENT' | 'PAST' | 'FUTURE';
export type Numbers = 'S' | 'P';

const modals = ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'];

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

export function getConjugation(verb: string, tense: EnglishTense, number: Numbers): string {
  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }
  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'number must be S or P';
    throw err;
  }

  if (tense === 'PRESENT' || tense === 'SIMPLE_PRESENT') {
    return getSimplePresent(verb, number);
  }

  return null;
}
