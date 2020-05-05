import { inflect, Options as InflectOptions } from './inflect';
import { Person, NumberSP, Mood, Tense } from './interfaces';

export type Person0To5 = 0 | 1 | 2 | 3 | 4 | 5;

export type SpanishTense =
  | 'INDICATIVE_PRESENT'
  | 'INDICATIVE_IMPERFECT'
  | 'INDICATIVE_PRETERITE'
  | 'INDICATIVE_FUTURE'
  | 'INDICATIVE_PERFECT'
  | 'INDICATIVE_PLUPERFECT'
  | 'INDICATIVE_FUTURE_PERFECT'
  | 'INDICATIVE_PRETERITE_PERFECT'
  | 'SUBJUNCTIVE_PRESENT'
  | 'SUBJUNCTIVE_IMPERFECT_RA'
  | 'SUBJUNCTIVE_IMPERFECT_SE'
  | 'SUBJUNCTIVE_FUTURE'
  | 'SUBJUNCTIVE_PERFECT'
  | 'SUBJUNCTIVE_PLUPERFECT'
  | 'SUBJUNCTIVE_FUTURE_PERFECT'
  | 'CONDITIONAL_PRESENT'
  | 'CONDITIONAL_PERFECT';

export const validTenses: string[] = [
  'INDICATIVE_PRESENT',
  'INDICATIVE_IMPERFECT',
  'INDICATIVE_PRETERITE',
  'INDICATIVE_FUTURE',
  'INDICATIVE_PERFECT',
  'INDICATIVE_PLUPERFECT',
  'INDICATIVE_FUTURE_PERFECT',
  'INDICATIVE_PRETERITE_PERFECT',
  'SUBJUNCTIVE_PRESENT',
  'SUBJUNCTIVE_IMPERFECT_RA',
  'SUBJUNCTIVE_IMPERFECT_SE',
  'SUBJUNCTIVE_FUTURE',
  'SUBJUNCTIVE_PERFECT',
  'SUBJUNCTIVE_PLUPERFECT',
  'SUBJUNCTIVE_FUTURE_PERFECT',
  'CONDITIONAL_PRESENT',
  'CONDITIONAL_PERFECT',
];

export function getConjugation(verb: string, tense: SpanishTense, person: Person0To5): string {
  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }

  if (person != 0 && person != 1 && person != 2 && person != 3 && person != 4 && person != 5) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'person must be 0 1 2 3 4 or 5';
    throw err;
  }

  if (!tense || validTenses.indexOf(tense) === -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `tense must be ${validTenses.join()}`;
    throw err;
  }

  const person1to5toOptions = {
    0: ['first', 'singular'],
    1: ['second', 'singular'],
    2: ['third', 'singular'],
    3: ['first', 'plural'],
    4: ['second', 'plural'],
    5: ['third', 'plural'],
  };

  const tenseToMoodTense = {
    INDICATIVE_PRESENT: ['indicative', 'present'],
    INDICATIVE_IMPERFECT: ['indicative', 'imperfect'],
    INDICATIVE_PRETERITE: ['indicative', 'preterite'],
    INDICATIVE_FUTURE: ['indicative', 'future'],
    INDICATIVE_PERFECT: ['indicative', 'perfect'],
    INDICATIVE_PLUPERFECT: ['indicative', 'pluperfect'],
    INDICATIVE_FUTURE_PERFECT: ['indicative', 'future perfect'],
    INDICATIVE_PRETERITE_PERFECT: ['indicative', 'preterite perfect'],
    SUBJUNCTIVE_PRESENT: ['subjunctive', 'present'],
    SUBJUNCTIVE_IMPERFECT_RA: ['subjunctive', 'imperfect -ra'],
    SUBJUNCTIVE_IMPERFECT_SE: ['subjunctive', 'imperfect -se'],
    SUBJUNCTIVE_FUTURE: ['subjunctive', 'future'],
    SUBJUNCTIVE_PERFECT: ['subjunctive', 'perfect'],
    SUBJUNCTIVE_PLUPERFECT: ['subjunctive', 'pluperfect'],
    SUBJUNCTIVE_FUTURE_PERFECT: ['subjunctive', 'future perfect'],
    CONDITIONAL_PRESENT: ['conditional', 'present'],
    CONDITIONAL_PERFECT: ['conditional', 'perfect'],
  };

  const options: InflectOptions = {
    person: person1to5toOptions[person][0] as Person,
    number: person1to5toOptions[person][1] as NumberSP,
    mood: tenseToMoodTense[tense][0] as Mood,
    tense: tenseToMoodTense[tense][1] as Tense,
    positivity: null,
    formality: null,
    style: 'castillano',
  };
  return inflect(verb, options);
}
