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

/*
"suivre":{"P":["suis","suis","suit","suivons","suivez","suivent"],"S":["suive","suives","suive","suivions","suiviez","suivent"],"Y":["NA","suis","NA","suivons","suivez","NA"],"I":["suivais","suivais","suivait","suivions","suiviez","suivaient"],"G":["suivant"],"K":["suivi","suivis","suivie","suivies"],"J":["suivis","suivis","suivit","suivîmes","suivîtes","suivirent"],"T":["suivisse","suivisses","suivît","suivissions","suivissiez","suivissent"],"F":["suivrai","suivras","suivra","suivrons","suivrez","suivront"],"C":["suivrais","suivrais","suivrait","suivrions","suivriez","suivraient"],"W":["suivre"]}
*/
// verb > tense > person
export interface VerbInfo {
  P: string[];
  S: string[];
  Y: string[];
  I: string[];
  G: string[];
  K: string[];
  J: string[];
  T: string[];
  F: string[];
  C: string[];
  W: string[];
}
export interface VerbsInfo {
  [key: string]: VerbInfo;
}

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

export function getVerbInfo(verbsInfo: VerbsInfo, verb: string): VerbInfo {
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

import listTransitive from 'french-verbs-transitive';
export function isTransitive(verb: string): boolean {
  return listTransitive.indexOf(verb) > -1;
}

const validTenses: string[] = [
  'PRESENT',
  'FUTUR',
  'IMPARFAIT',
  'PASSE_SIMPLE',
  'CONDITIONNEL_PRESENT',
  'IMPERATIF_PRESENT',
  'SUBJONCTIF_PRESENT',
  'SUBJONCTIF_IMPARFAIT',
  'PASSE_COMPOSE',
  'PLUS_QUE_PARFAIT',
];

export type FrenchAux = 'AVOIR' | 'ETRE';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';

export function getConjugation(
  verbsList: VerbsInfo,
  verb: string,
  tense: string,
  person: number,
  aux: FrenchAux,
  agreeGender: GendersMF,
  agreeNumber: Numbers,
  pronominal: boolean,
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

  if (!agreeGender) {
    agreeGender = 'M';
  }
  if (!agreeNumber) {
    agreeNumber = 'S';
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

  // console.log( JSON.stringify(verbInfo) );

  const tenseMapping = {
    PRESENT: 'P', // indicatif présent
    FUTUR: 'F', // indicatif futur
    IMPARFAIT: 'I', // indicatif imparfait
    PASSE_SIMPLE: 'J', // indicatif passé-simple
    CONDITIONNEL_PRESENT: 'C', // conditionnel présent
    IMPERATIF_PRESENT: 'Y', // impératif présent
    SUBJONCTIF_PRESENT: 'S', // subjonctif présent
    SUBJONCTIF_IMPARFAIT: 'T', // subjonctif imparfait
    //'PARTICIPE_PASSE': 'K', // participe passé
    //'PARTICIPE_PRESENT': 'G', // participe présent
    //'INFINITIF': 'W' // infinitif présent
  };

  let conjugated: string;

  if (tense === 'PASSE_COMPOSE' || tense === 'PLUS_QUE_PARFAIT') {
    if (!aux) {
      if (pronominal) {
        aux = 'ETRE';
      } else if (alwaysAuxEtre(verb)) {
        aux = 'ETRE';
      } else if (isTransitive(verb)) {
        aux = 'AVOIR'; // rather AVOIR if not specified
      } else {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `aux property must be set with ${tense} for ${verb}`;
        throw err;
      }
    } else if (aux != 'AVOIR' && aux != 'ETRE') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `aux must be AVOIR or ETRE`;
      throw err;
    }

    const tempsAux: string = tense === 'PASSE_COMPOSE' ? 'P' : 'I'; // présent ou imparfait
    const conjugatedAux: string = getVerbInfo(null, aux === 'AVOIR' ? 'avoir' : 'être')[tempsAux][person];
    const participePasseList: string[] = verbInfo['K'];

    if (!participePasseList) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no participe passé for ${verb}`;
      throw err;
    }

    const mappingGenderNumber = { MS: 0, MP: 1, FS: 2, FP: 3 };
    const indexGenderNumber: number = mappingGenderNumber[agreeGender + agreeNumber];
    const participePasse: string = participePasseList[indexGenderNumber];
    // console.log(`${agreeGender+agreeNumber} ${indexGenderNumber}`);

    /* istanbul ignore if */
    if (!participePasse) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no participe passé form for ${verb}`;
      throw err;
    }

    conjugated = `${conjugatedAux} ${participePasse}`;
  } else {
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

    conjugated = formInLib;
  }

  if (pronominal) {
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
  } else {
    return conjugated;
  }
}
