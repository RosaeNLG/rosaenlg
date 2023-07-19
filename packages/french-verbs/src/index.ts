/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

/*

8 temps de l'indicatif :
  Présent ✓
  Passé composé ✓
  Imparfait ✓
  Plus-que-parfait ✓
  Passé simple ✓
  Passé antérieur ✓
  Futur simple ✓
  Futur antérieur ✓

4 temps du subjonctif :
  Présent ✓
  Passé ✓
  Imparfait ✓
  Plus-que-parfait ✓

3 temps du conditionnel :
  Présent ✓
  Passé 1ère forme ✓
  Passé 2ème forme ✓

2 temps de l'impératif :
  Présent ✓
  Passé ✓

3 temps du participe :
  Présent
  Passé
  Passé composé (ayant été)

2 temps de l'infinitif :
  Présent ✓
  Passé ✓

2 temps du gérondif :
  Présent
  Passé 
*/

import { beginsWithVowel, isContractedVowelWord, isHMuet } from 'french-contractions';
import { VerbInfo, VerbsInfo, VerbInfoIndex } from 'french-verbs-lefff';

const composedTenses: string[] = [
  'PASSE_COMPOSE',
  'PLUS_QUE_PARFAIT',
  'FUTUR_ANTERIEUR',
  'PASSE_ANTERIEUR',
  'SUBJONCTIF_PASSE',
  'SUBJONCTIF_PLUS_QUE_PARFAIT',
  'CONDITIONNEL_PASSE',
  'CONDITIONNEL_PASSE_2E_FORME',
  'IMPERATIF_PASSE',
];

const validTenses: string[] = [
  'PRESENT',
  'FUTUR',
  'IMPARFAIT',
  'PASSE_SIMPLE',
  'CONDITIONNEL_PRESENT',
  'IMPERATIF_PRESENT',
  'SUBJONCTIF_PRESENT',
  'SUBJONCTIF_IMPARFAIT',
  ...composedTenses
];

/*--------------------------------------------------------------------
  Tense                           | Conjugation Required        | Key
  --------------------------------------------------------------------
  PRESENT                         | indicatif présent           |  P
  FUTUR                           | indicatif futur             |  F
  IMPARFAIT                       | indicatif imparfait         |  I
  PASSE_SIMPLE                    | indicatif passé-simple      |  J
  CONDITIONNEL_PRESENT            | conditionnel présent        |  C
  IMPERATIF_PRESENT               | impératif présent           |  Y
  SUBJONCTIF_PRESENT              | subjonctif présent          |  S
  SUBJONCTIF_IMPARFAIT            | subjonctif imparfait        |  T
  PASSE_COMPOSE                   | indicatif présent *         |  P
  PLUS_QUE_PARFAIT                | indicatif imparfait *       |  I
  FUTUR_ANTERIEUR                 | indicatif futur *           |  F
  PASSE_ANTERIEUR                 | indicatif passé-simple *    |  J
  SUBJONCTIF_PASSE                | subjonctif présent *        |  S
  SUBJONCTIF_PLUS_QUE_PARFAIT     | subjonctif imparfait *      |  T
  CONDITIONNEL_PASSE              | conditionnel présent *      |  C
  IMPERATIF_PASSE                 | impératif présent *         |  Y
  --------------------------------------------------------------------

  * NOTE: The conjugation required for composed tenses pertains to their auxiliary verbs.

  */

const tenseMapping: { [index: string]: VerbInfoIndex } = {
  PRESENT: 'P',
  FUTUR: 'F',
  IMPARFAIT: 'I',
  PASSE_SIMPLE: 'J',
  CONDITIONNEL_PRESENT: 'C',
  IMPERATIF_PRESENT: 'Y',
  SUBJONCTIF_PRESENT: 'S',
  SUBJONCTIF_IMPARFAIT: 'T',
  PASSE_COMPOSE: 'P',
  PLUS_QUE_PARFAIT: 'I',
  FUTUR_ANTERIEUR: 'F',
  PASSE_ANTERIEUR: 'J',
  SUBJONCTIF_PASSE: 'S',
  SUBJONCTIF_PLUS_QUE_PARFAIT: 'T',
  CONDITIONNEL_PASSE: 'C',
  IMPERATIF_PASSE: 'Y',
  //'PARTICIPE_PASSE': 'K', // participe passé
  //'PARTICIPE_PRESENT': 'G', // participe présent
  //'INFINITIF': 'W' // infinitif présent
};

const conjAvoir: VerbInfo = {
  P: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
  S: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
  Y: ['NA', 'aie', 'NA', 'ayons', 'ayez', 'NA'],
  F: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
  C: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
  I: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
  W: ['avoir'],
  G: ['ayant'],
  K: ['eu', 'eus', 'eue', 'eues'],
  J: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'],
  T: ['eusse', 'eusses', 'eût', 'eussions', 'eussiez', 'eussent'],
};
const conjEtre: VerbInfo = {
  P: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
  J: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'],
  T: ['fusse', 'fusses', 'fût', 'fussions', 'fussiez', 'fussent'],
  F: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
  C: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'],
  S: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
  Y: ['NA', 'sois', 'NA', 'soyons', 'soyez', 'NA'],
  I: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
  G: ['étant'],
  K: ['été', 'été', 'été', 'été'],
  W: ['être'],
};

export function getVerbInfo(verbsInfo: VerbsInfo | null, verb: string): VerbInfo {
  if (verb === 'avoir') return conjAvoir;
  if (verb === 'être') return conjEtre;

  if (!verbsInfo) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verbs list must not be null';
    throw err;
  }

  const verbInfo: VerbInfo = verbsInfo[verb];
  if (!verbInfo) {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in dict`;
    throw err;
  }
  return verbInfo;
}

// is required at runtime (not only comp)
const listEtre = [
  'aller',
  'apparaître',
  'arriver',
  'débeller',
  'décéder',
  'devenir',
  'échoir',
  'entrer',
  'intervenir',
  'mourir',
  'naitre',
  'naître',
  'partir',
  'parvenir',
  'provenir',
  'redevenir',
  'repartir',
  'rester',
  'resurvenir',
  'retomber',
  'revenir',
  'survenir',
  'tomber',
  'venir',
];
export function alwaysAuxEtre(verb: string): boolean {
  return listEtre.indexOf(verb) > -1;
}

import listTransitive from 'french-verbs-transitive/dist/transitive.json';
export function isTransitive(verb: string): boolean {
  return listTransitive.indexOf(verb) > -1;
}



export type FrenchAux = 'AVOIR' | 'ETRE';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';

export function getAux(verb: string, aux: FrenchAux, pronominal: boolean | undefined): FrenchAux {
  if (aux) {
    if (aux != 'AVOIR' && aux != 'ETRE') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `aux must be AVOIR or ETRE`;
      throw err;
    } else {
      return aux;
    }
  } else {
    if (pronominal) {
      return 'ETRE';
    } else if (alwaysAuxEtre(verb)) {
      return 'ETRE';
    } else if (isTransitive(verb)) {
      return 'AVOIR'; // rather AVOIR if not specified
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `aux property must be set with this tense for ${verb}`;
      throw err;
    }
  }
}
function getConjugatedComposed(
  verbInfo: VerbInfo,
  verb: string,
  tense: string,
  person: number,
  composedTenseOptions: ComposedTenseOptions,
  pronominal: boolean,
  negativeAdverb: string | undefined,
  modifierAdverb: string | undefined,
): string {
  if (!composedTenseOptions) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `ComposedTenseOptions is mandatory when tense is one of the following: ${composedTenses.join(', ')}`;
    throw err;
  }

  const agreeGender = composedTenseOptions.agreeGender || 'M';
  const agreeNumber = composedTenseOptions.agreeNumber || 'S';

  const aux = getAux(verb, composedTenseOptions.aux as FrenchAux, pronominal);

  const tempsAux: VerbInfoIndex = tenseMapping[tense];

  // get conjugated aux
  const auxInfo = getVerbInfo(null, aux === 'AVOIR' ? 'avoir' : 'être');
  const conjugatedAux: string = (auxInfo[tempsAux] as string[])[person];

  const participePasseList: string[] = verbInfo['K'] as string[];

  if (!participePasseList) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `no participe passé for ${verb}`;
    throw err;
  }

  const mappingGenderNumber: { [index: string]: number } = { MS: 0, MP: 1, FS: 2, FP: 3 };
  const indexGenderNumber: number = mappingGenderNumber[agreeGender + agreeNumber];
  const participePasse: string = participePasseList[indexGenderNumber];

  /* istanbul ignore if */
  if (!participePasse) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `no participe passé form for ${verb}`;
    throw err;
  }

  const insertModifier = modifierAdverb ? modifierAdverb + ' ' : '';
  const insertNegative = negativeAdverb ? negativeAdverb + ' ' : '';
  const resWithNegative = conjugatedAux + ' ' + insertNegative + insertModifier + participePasse;

  return resWithNegative;
}

function getConjugatedNoComposed(
  verbInfo: VerbInfo,
  verb: string,
  tense: string,
  person: number,
  negativeAdverb: string | undefined,
  modifierAdverb: string | undefined,
): string {
  const indexTemps = tenseMapping[tense];

  const tenseInLib = verbInfo[indexTemps];
  if (!tenseInLib) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${tense} tense not available in French for ${verb}`;
    throw err;
  }

  const formInLib = tenseInLib[person];
  if (!formInLib || formInLib === 'NA') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `person ${person} not available in French for ${verb} in ${tense}`;
    throw err;
  }

  const insertModifier = modifierAdverb ? ' ' + modifierAdverb : '';
  const insertNegative = negativeAdverb ? ' ' + negativeAdverb : '';

  return formInLib + insertNegative + insertModifier;
}

function processPronominal(verb: string, person: number, conjugated: string): string {
  const pronominalMapping: string[] = ['me', 'te', 'se', 'nous', 'vous', 'se'];
  let contract = false;

  if ([0, 1, 2, 5].indexOf(person) > -1) {
    // potential contraction

    // for the h muet test: take infinitive, not conjugated form (list does not contain flex forms)
    if ((beginsWithVowel(conjugated) && isContractedVowelWord(conjugated)) || isHMuet(verb)) {
      contract = true;
    }
  }

  if (contract) {
    return `${pronominalMapping[person].substring(0, 1)}'${conjugated}`;
  } else {
    return `${pronominalMapping[person]} ${conjugated}`;
  }
}

export interface ComposedTenseOptions {
  aux?: FrenchAux;
  agreeGender?: GendersMF;
  agreeNumber?: Numbers;
}

export function getConjugation(
  verbsList: VerbsInfo,
  verb: string,
  tense: string,
  person: number,
  composedTenseOptions: ComposedTenseOptions,
  pronominal: boolean,
  negativeAdverb: string | undefined,
  modifierAdverb: string | undefined,
): string {
  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }

  if (person == null) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'person must not be null';
    throw err;
  }

  if (!tense || validTenses.indexOf(tense) === -1) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `tense must be ${validTenses.join()}`;
    throw err;
  }

  // s'écrier, se rendre...
  if (verb.startsWith('se ')) {
    pronominal = true;
    verb = verb.replace(/^se\s+/, '');
  } else if (verb.startsWith("s'")) {
    pronominal = true;
    verb = verb.replace(/^s'\s*/, '');
  }

  const verbInfo: VerbInfo = getVerbInfo(verbsList, verb);

  let conjugated: string;

  if (composedTenses.includes(tense)) {
    conjugated = getConjugatedComposed
  (
      verbInfo,
      verb,
      tense,
      person,
      composedTenseOptions,
      pronominal,
      negativeAdverb,
      modifierAdverb,
    );
  } else {
    conjugated = getConjugatedNoComposed(verbInfo, verb, tense, person, negativeAdverb, modifierAdverb);
  }

  if (pronominal) {
    return processPronominal(verb, person, conjugated);
  } else {
    return conjugated;
  }
}
