/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

/*

8 temps de l'indicatif :
  Présent
  Passé composé
  Imparfait
  Plus-que-parfait
  Passé simple
  Passé antérieur
  Futur simple
  Futur antérieur

4 temps du subjonctif :
  Présent
  Passé
  Imparfait
  Plus-que-parfait

3 temps du conditionnel :
  Présent
  Passé 1ère forme
  Passé 2ème forme

2 temps de l'impératif :
  Présent
  Passé

2 temps du participe :
  Présent
  Passé

2 temps de l'infinitif :
  Présent
  Passé

2 temps du gérondif :
  Présent
  Passé
*/

import { beginsWithVowel, isContractedVowelWord, isHMuet } from 'french-contractions';
import { VerbInfo, VerbInfoIndex, VerbsInfo } from 'french-verbs-lefff';

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

// The following list is the exhaustive list of French tenses
export const validTenses = [
  'PRESENT',
  'FUTUR',
  'IMPARFAIT',
  'PASSE_SIMPLE',
  'PASSE_COMPOSE',
  'PLUS_QUE_PARFAIT',
  'PASSE_ANTERIEUR',
  'FUTUR_ANTERIEUR',

  'CONDITIONNEL_PRESENT',
  'CONDITIONNEL_PASSE_1',
  'CONDITIONNEL_PASSE_2',
  'IMPERATIF_PRESENT',
  'IMPERATIF_PASSE',
  'SUBJONCTIF_PRESENT',
  'SUBJONCTIF_IMPARFAIT',
  'SUBJONCTIF_PASSE',
  'SUBJONCTIF_PLUS_QUE_PARFAIT',

  'INFINITIF',
  'INFINITIF_PASSE',
  'PARTICIPE_PRESENT',
  'PARTICIPE_PASSE',
  'PARTICIPE_PASSE_COMPOSE',
] as const;
export type Tense = typeof validTenses[number];

const composedTenses = [
  'PASSE_COMPOSE',
  'PLUS_QUE_PARFAIT',
  'PASSE_ANTERIEUR',
  'FUTUR_ANTERIEUR',
  'CONDITIONNEL_PASSE_1',
  'CONDITIONNEL_PASSE_2',
  'IMPERATIF_PASSE',
  'SUBJONCTIF_PASSE',
  'SUBJONCTIF_PLUS_QUE_PARFAIT',
  'INFINITIF_PASSE',
  'PARTICIPE_PASSE',
  'PARTICIPE_PASSE_COMPOSE',
] as const;
type ComposedTense = typeof composedTenses[number];

const noPersonTenses = [
  'INFINITIF',
  'INFINITIF_PASSE',
  'PARTICIPE_PRESENT',
  'PARTICIPE_PASSE',
  'PARTICIPE_PASSE_COMPOSE',
] as const;
type NoPersonTense = typeof validTenses[number];

export const isComposedTense = (tense: Tense): tense is ComposedTense => {
  return ((composedTenses as unknown) as string[]).indexOf(tense) > -1;
};

export const isNoPersonTense = (tense: Tense): tense is NoPersonTense => {
  return ((noPersonTenses as unknown) as string[]).indexOf(tense) > -1;
};

export type FrenchAux = 'AVOIR' | 'ETRE';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type Voice = 'Act' | 'Pass';

export function isTransitive(verb: string): boolean {
  return listTransitive.indexOf(verb) > -1;
}

const tenseMapping: { [index: string]: VerbInfoIndex } = {
  PRESENT: 'P', // indicatif présent
  FUTUR: 'F', // indicatif futur
  IMPARFAIT: 'I', // indicatif imparfait
  PASSE_SIMPLE: 'J', // indicatif passé-simple
  CONDITIONNEL_PRESENT: 'C', // conditionnel présent
  IMPERATIF_PRESENT: 'Y', // impératif présent
  SUBJONCTIF_PRESENT: 'S', // subjonctif présent
  SUBJONCTIF_IMPARFAIT: 'T', // subjonctif imparfait
  PARTICIPE_PASSE: 'K', // participe passé
  PARTICIPE_PRESENT: 'G', // participe présent
  INFINITIF: 'W', // infinitif présent
};

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

export function getAuxPassive(tense: Tense): FrenchAux {
  if (isComposedTense(tense)) {
    return 'AVOIR';
  }
  return 'ETRE';
}
export function getTenseAux(tense: ComposedTense): VerbInfoIndex {
  switch (tense) {
    case 'PASSE_COMPOSE':
      return 'P';
    case 'PLUS_QUE_PARFAIT':
      return 'I';
    case 'PASSE_ANTERIEUR':
      return 'J';
    case 'FUTUR_ANTERIEUR':
      return 'F';
    case 'CONDITIONNEL_PASSE_1':
      return 'C';
    case 'CONDITIONNEL_PASSE_2':
      return 'T';
    case 'IMPERATIF_PASSE':
      return 'Y';
    case 'SUBJONCTIF_PASSE':
      return 'S';
    case 'SUBJONCTIF_PLUS_QUE_PARFAIT':
      return 'T';
    case 'INFINITIF_PASSE':
      return 'W';
    case 'PARTICIPE_PASSE_COMPOSE':
      return 'G';
    case 'PARTICIPE_PASSE': //not really useful
      return 'P';
  }
}

export function getTenseAuxPassive(tense: Tense): VerbInfoIndex {
  if (isComposedTense(tense)) {
    return getTenseAux(tense);
  }
  return tenseMapping[tense];
}

function getConjugatedComposedTenseOrPassive(
  verbInfo: VerbInfo,
  verb: string,
  tense: Tense,
  person: number,
  composedTenseOptions: ComposedTenseOptions,
  pronominal: boolean,
  negativeAdverb: string | undefined,
  modifierAdverb: string | undefined,
  voice: Voice,
): string {
  if (!composedTenseOptions) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `ComposedTenseOptions is mandatory when tense is composed or voice passive`;
    throw err;
  }

  const agreeGender = composedTenseOptions.agreeGender || 'M';
  const agreeNumber = composedTenseOptions.agreeNumber || 'S';
  const aux = voice === 'Pass' ? getAuxPassive(tense) : getAux(verb, composedTenseOptions.aux as FrenchAux, pronominal);
  const tempsAux: VerbInfoIndex = voice === 'Pass' ? getTenseAuxPassive(tense) : getTenseAux(tense as ComposedTense);

  // get conjugated aux
  const auxInfo = getVerbInfo(null, aux === 'AVOIR' ? 'avoir' : 'être');

  const conjugatedAux: string = isNoPersonTense(tense)
    ? (auxInfo[tempsAux] as string[])[0]
    : (auxInfo[tempsAux] as string[])[person];

  const participePasseList: string[] = verbInfo['K'] as string[];

  if (!participePasseList) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `no participe passé for ${verb}`;
    throw err;
  }

  const mappingGenderNumber: { [index: string]: number } = { MS: 0, MP: 1, FS: 2, FP: 3 };
  const indexGenderNumber: number = mappingGenderNumber[agreeGender + agreeNumber];
  const participePasse: string =
    voice === 'Pass' && isComposedTense(tense)
      ? 'été ' + participePasseList[indexGenderNumber]
      : participePasseList[indexGenderNumber];

  /* istanbul ignore if */
  if (!participePasse) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `no participe passé form for ${verb}`;
    throw err;
  }

  const conjugatedAuxWithPronominal = pronominal
    ? processPronominal(verb, person, conjugatedAux) + ' '
    : conjugatedAux + ' ';

  const insertModifier = modifierAdverb ? modifierAdverb + ' ' : '';
  const insertNegative = negativeAdverb ? negativeAdverb + ' ' : '';
  const resWithNegative =
    (tense === 'PARTICIPE_PASSE' ? '' : conjugatedAuxWithPronominal) + insertNegative + insertModifier + participePasse;

  return resWithNegative;
}

function getConjugatedNoComposedAndActive(
  verbInfo: VerbInfo,
  verb: string,
  tense: Tense,
  person: number,
  negativeAdverb: string | undefined,
  modifierAdverb: string | undefined,
  pronominal: boolean,
): string {
  const indexTemps = tenseMapping[tense];

  const tenseInLib = verbInfo[indexTemps];
  if (!tenseInLib) {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${tense} tense not available in French for ${verb}`;
    throw err;
  }

  const formInLib = isNoPersonTense(tense) ? tenseInLib[0] : tenseInLib[person];
  if (!formInLib || formInLib === 'NA') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `person ${person} not available in French for ${verb} in ${tense}`;
    throw err;
  }

  const conjugated = pronominal ? processPronominal(verb, person, formInLib) : formInLib;

  if (tense === 'INFINITIF') {
    const insertModifier = modifierAdverb ? modifierAdverb + ' ' : '';
    const insertNegative = negativeAdverb ? negativeAdverb + ' ' : '';
    return insertNegative + insertModifier + conjugated;
  }
  const insertModifier = modifierAdverb ? ' ' + modifierAdverb : '';
  const insertNegative = negativeAdverb ? ' ' + negativeAdverb : '';
  return conjugated + insertNegative + insertModifier;
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
  tense: Tense,
  person: number,
  composedTenseOptions: ComposedTenseOptions,
  pronominal: boolean,
  negativeAdverb: string | undefined,
  modifierAdverb: string | undefined,
  voice: Voice,
): string {
  if (!verb) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }

  if (person == null && (!isNoPersonTense(tense) || pronominal)) {
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

  if (isComposedTense(tense) || voice === 'Pass') {
    conjugated = getConjugatedComposedTenseOrPassive(
      verbInfo,
      verb,
      tense,
      person,
      composedTenseOptions,
      pronominal,
      negativeAdverb,
      modifierAdverb,
      voice,
    );
  } else {
    conjugated = getConjugatedNoComposedAndActive(
      verbInfo,
      verb,
      tense,
      person,
      negativeAdverb,
      modifierAdverb,
      pronominal,
    );
  }

  return conjugated;
}
