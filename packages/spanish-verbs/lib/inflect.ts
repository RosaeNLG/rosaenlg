/**
 * @license
 * Copyright 2019 Ludan Stoecklé, 2017, HealthTap, Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Formality, Mood, NumberSP, Person, Positivity, Style, Tense } from './interfaces';
import * as stylesFile from './styles';
import * as verbsOUEFile from './verbsOUE';
import * as exceptionsFile from './exceptions';
import { EndingsPerPerson, EndingsPerPersonPerNumber, endingsSuffix, endingsAux } from './endings';

const styles = stylesFile.styles;
const verbsOUE = verbsOUEFile.verbsOUE;
const exceptions = exceptionsFile.exceptions;

function fixStem(stem: string, ending: string, suffix, options): string {

  const whole = stem + ending;
  if (
    (options.mood === 'imperative' || options.tense === 'present') &&
    verbsOUE.indexOf(whole) > -1 &&
    (options.person === 'third' || options.number === 'singular')
  ) {
    stem = stem.replace('o', 'ue');
  }

  switch (ending) {
    case 'ar': {
      if (stem.substr(-1) === 'c' && (suffix[0] === 'e' || suffix[0] === 'é')) {
        stem = stem.substring(0, stem.length - 1) + 'qu';
      } else if (stem.substr(-1) === 'g' && (suffix[0] === 'e' || suffix[0] === 'é')) {
        stem = stem.substring(0, stem.length - 1) + 'gu';
      } else if (stem.substr(-1) === 'z' && (suffix[0] === 'e' || suffix[0] === 'é')) {
        stem = stem.substring(0, stem.length - 1) + 'c';
      }
      break;
    }
    case 'er': {
      const stemEnd = stem.substr(-2);
      if ((stemEnd === 'oc' || stemEnd === 'ec') && (suffix[0] === 'a' || suffix[0] === 'á' || suffix[0] === 'o')) {
        stem = stem.substring(0, stem.length - 1) + 'zc';
      }
      break;
    }
    case 'ir': {
      if (stem.substr(-2) === 'uc' && (suffix[0] === 'a' || suffix[0] === 'á' || suffix[0] === 'o')) {
        stem = stem.substring(0, stem.length - 1) + 'zc';
      }
      break;
    }
  }

  return stem;
}

export interface Options {
  person: Person;
  number: NumberSP;
  mood: Mood;
  tense: Tense;
  // gender;
  positivity: Positivity;
  formality: Formality;
  style: Style;
  // reflection;
}

const validTenses = [
  'present',
  'imperfect',
  'preterite',
  'future',
  'perfect',
  'pluperfect',
  'future perfect',
  'preterite perfect',
  'imperfect -ra',
  'imperfect -se',
];
/**
 * Inflect the given verb according to the given parameters.
 * The parameters are given as an object that contains
 * any of the following properties:
 *
 * <ul>
 * <li>person
 * <li>number
 * <li>mood
 * <li>tense
 * <li>gender
 * <li>positivity
 * <li>formality
 * <li>style
 * <li>reflection
 * </ul>
 * <p>
 * The person is given as one of the following strings:
 *
 * <ul>
 * <li>first - "I" and "we"
 * <li>second - "you" (singular) and "you" (plural)
 * <li>third - "he/she/it" and "they" (plural)
 * </ul>
 *
 * Default: first
 * <p>
 *
 * The number is given as any one of the following strings:
 *
 * <ul>
 * <li>singular - one person
 * <li>plural - multiple people
 * </ul>
 *
 * Default: singular
 * <p>
 *
 * The mood is given as any one of the following strings:
 *
 * <ul>
 * <li>indicative
 * <li>subjunctive
 * <li>conditional
 * <li>imperative
 * </ul>
 *
 * Default: indicative
 * <p>
 *
 * The tense is given as any one of the following strings depending
 * on the mood:
 *
 * <ul>
 * <li>indicative
 *   <ul>
 *   <li>present
 *   <li>imperfect
 *   <li>preterite
 *   <li>future
 *   <li>perfect
 *   <li>pluperfect
 *   <li>future perfect
 *   <li>preterite perfect
 *   </ul>
 * <li>subjunctive
 *   <ul>
 *   <li>present
 *   <li>imperfect -ra
 *   <li>imperfect -se
 *   <li>future
 *   <li>perfect
 *   <li>pluperfect
 *   <li>future perfect
 *   </ul>
 * <li>conditional
 *   <ul>
 *   <li>present
 *   <li>perfect
 *   </ul>
 * </ul>
 *
 * Default: present
 * <p>
 *
 * The gender is only necessary when the mood is "perfect" or "perfect subjunctive"
 * and indicates the gender of the person being spoken of:
 *
 * <ul>
 * <li>masculine
 * <li>feminine
 * </ul>
 *
 * Default: masculine
 * <p>
 *
 * The positivity is only necessary when the mood is imperative and is specified
 * with one of the following strings:
 *
 * <ul>
 * <li>affirmative - a command to do something
 * <li>negative - a command not to do something
 * </ul>
 *
 * Default: affirmative
 * <p>
 * The style parameter specifies which style of Spanish to use. This controls how
 * a verb is conjugated, especially for the second person forms. Valid values are:
 *
 * <ul>
 * <li>castillano - Spanish as spoken in Spain
 * <li>rioplatense - Spanish as spoken around the Rio de la Plata in South America. This
 * includes Argentina, Uruguay, Eastern Bolivia, and Paraguay
 * <li>chileano - Spanish as spoken in Chile
 * <li>centroamericano - Spanish as spoken in Central America
 * <li>mexicano - Spanish as spoken in Mexico
 * <li>caribeno - Spanish as spoken in Caribbean nations such as Cuba and Puerto Rico
 * <li>andino - Spanish as spoken in various Pacific Andean nations such as Peru and Ecuador
 * </ul>
 *
 * Default: castillano
 *
 * @param {String} verb the infinitive form of the verb to inflect
 * @param {Object} options optional parameters as per above
 * @returns {String} the inflected verb
 */
export function inflect(verb: string, options: Options): string {
  if (!verb || verb.length < 2) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `invalid verb`;
    throw err;
  }

  let ret: string;
  const ending = verb.substr(-2);

  if (!(ending in endingsSuffix)) {
    // not a verb -- can't inflect it!
    return verb;
  }

  let stem = verb.substring(0, verb.length - 2);

  let person = options.person;
  if (person != 'first' && person != 'second' && person != 'third') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `person must be first second or third`;
    throw err;
  }

  const number = options.number;
  if (number != 'singular' && number != 'plural') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `number must be singular or plural`;
    throw err;
  }

  const mood = options.mood;
  if (mood != 'indicative' && mood != 'subjunctive' && mood != 'conditional' && mood != 'imperative') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `invalid mood`;
    throw err;
  }

  const tense = options.tense;
  if (mood != 'imperative' && validTenses.indexOf(tense) == -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `invalid tense`;
    throw err;
  }

  const positivity = (options && options.positivity) || 'affirmative';
  const styling = (options && options.style && styles[options.style]) || styles['castillano'];
  const formality = options.formality || 'informal';

  // ignore for castillano
  // istanbul ignore next
  if (styling.tuteo && person === 'second' && number === 'singular' && formality === 'formal') {
    // in tuteo regions, you always use tu instead of usted
    // for castillano we don't care
    // istanbul ignore next
    // formality = 'informal';
  }

  // ignore for castillano
  // istanbul ignore next
  if (styling.ustedes && person === 'second' && number === 'plural') {
    // in ustedes regions, the plural of tu is not vosotros, but ustedes instead,
    // which is the same as the third person plural
    // for castillano we don't care
    // istanbul ignore next
    person = 'third';
  }

  if (tense === 'perfect' || tense === 'pluperfect' || tense === 'future perfect' || tense === 'preterite perfect') {
    const personObj = endingsAux[person];
    const pluralityObj = personObj[number];
    const moodObj = pluralityObj[mood];
    const aux = moodObj[tense];
    const suffix = endingsSuffix[ending]['past participle'].singular.masculine;
    const pastParticiple = (exceptions[verb] && exceptions[verb]['past participle']) || stem + suffix;
    ret = aux + ' ' + pastParticiple;
  } else {
    if (exceptions[verb]) {
      // see if the requested options cause an exceptional inflection, else generate the regular inflection below
      if (exceptions[verb] && exceptions[verb][mood]) {
        const moodObj = exceptions[verb][mood];
        const property = mood === 'imperative' ? positivity : tense;
        const tenseObj = moodObj[property];
        if (tenseObj && tenseObj[number] && tenseObj[number][person]) {
          const exc = tenseObj[number][person];
          // istanbul ignore next
          if (typeof exc === 'string') {
            ret = exc;
          } else {
            // no such thing in exceptions - it is not used
            // istanbul ignore next
            ret = exc[styling.voseo ? 'vos' : 'tu'];
          }
        }
      }
    }

    if (!ret) {
      const personObj: EndingsPerPerson = endingsSuffix[ending][person];
      const pluralityObj: EndingsPerPersonPerNumber = personObj[number];
      const moodObj = pluralityObj[mood];
      if (typeof moodObj === 'string') {
        stem = fixStem(stem, ending, moodObj, options);
        ret = stem + moodObj;
      } else {
        const property = mood === 'imperative' ? positivity : tense;
        const tenseObj = moodObj[property];
        // istanbul ignore else
        if (tenseObj) {
          if (typeof tenseObj === 'string') {
            stem = fixStem(stem, ending, tenseObj, options);
            ret = stem + tenseObj;
          } else {
            // only castillano at the moment
            // istanbul ignore next
            const suffix = tenseObj[styling.voseo ? 'vos' : 'tu'];
            stem = fixStem(stem, ending, suffix, options);
            ret = stem + suffix;
          }
        } else {
          const err = new Error();
          err.name = 'DictError';
          err.message = `no ${property} property for ${JSON.stringify(moodObj)}`;
          throw err;
        }
      }

      // fixes
      // eyeron-eieron-morph construction https://www.fcg-net.org/demos/morphology/inflectional-patterns/
      if (ret && ret.endsWith('eieron')) {
        ret = ret.replace(/eieron$/, 'eyeron');
      }
    }
  }

  return ret;
}
