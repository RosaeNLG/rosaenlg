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

import fs = require('fs');
import { isHAspire } from '@rosaenlg/french-h-muet-aspire';

//import * as Debug from 'debug';
//const debug = Debug('french-verbs');

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

let verbsInfo: VerbsInfo;

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

export function getVerbInfo(verb: string): VerbInfo {
  if (verb === 'avoir') return conjAvoir;
  if (verb === 'être') return conjEtre;

  // lazy loading
  if (verbsInfo) {
    // debug('did not reload');
  } else {
    // debug('load');
    try {
      verbsInfo = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/conjugation/conjugations.json', 'utf8'));
    } catch (err) {
      // istanbul ignore next
      console.log(`could not read French verbs on disk: ${verb}`);
      // istanbul ignore next
      return null;
    }
  }

  const verbInfo: VerbInfo = verbsInfo[verb];
  if (!verbInfo) {
    let err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in lefff french dict`;
    throw err;
  }
  return verbInfo;
}

let listEtre: string[];
export function alwaysAuxEtre(verb: string): boolean {
  if (listEtre) {
    // debug('did not reload');
  } else {
    // debug('load');
    listEtre = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/etre.json', 'utf8'));
  }
  return listEtre.indexOf(verb) > -1;
}

let listIntransitive: string[];
export function isIntransitive(verb: string): boolean {
  if (listIntransitive) {
    // debug('did not reload');
  } else {
    // debug('load');
    listIntransitive = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/intransitive.json', 'utf8'));
  }
  return listIntransitive.indexOf(verb) > -1;
}

let listTransitive: string[];
export function isTransitive(verb: string): boolean {
  if (listTransitive) {
    // debug('did not reload');
  } else {
    // debug('load');
    listTransitive = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/transitive/transitive.json', 'utf8'));
  }

  return listTransitive.indexOf(verb) > -1;
}

export type FrenchTense =
  | 'PRESENT'
  | 'FUTUR'
  | 'IMPARFAIT'
  | 'PASSE_SIMPLE'
  | 'CONDITIONNEL_PRESENT'
  | 'IMPERATIF_PRESENT'
  | 'SUBJONCTIF_PRESENT'
  | 'SUBJONCTIF_IMPARFAIT'
  | 'PASSE_COMPOSE'
  | 'PLUS_QUE_PARFAIT';
export type FrenchAux = 'AVOIR' | 'ETRE';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';

export function getConjugation(
  verb: string,
  tense: FrenchTense,
  person: number,
  aux: FrenchAux,
  agreeGender: GendersMF,
  agreeNumber: Numbers,
  pronominal: boolean,
  verbsSpecificList: VerbsInfo,
): string {
  function getLocalVerbInfo(verb: string): VerbInfo {
    if (verbsSpecificList && verbsSpecificList[verb]) {
      return verbsSpecificList[verb];
    } else {
      return getVerbInfo(verb);
    }
  }

  if (!verb) {
    let err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }

  if (person == null) {
    let err = new Error();
    err.name = 'TypeError';
    err.message = 'person must not be null';
    throw err;
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
  if (!tense || validTenses.indexOf(tense) === -1) {
    let err = new Error();
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

  let verbInfo: VerbInfo = getLocalVerbInfo(verb);

  // debug( JSON.stringify(verbInfo) );

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

  var conjugated: string;

  if (tense === 'PASSE_COMPOSE' || tense === 'PLUS_QUE_PARFAIT') {
    if (!aux) {
      if (pronominal) {
        aux = 'ETRE';
      } else if (alwaysAuxEtre(verb)) {
        aux = 'ETRE';
      } else if (isTransitive(verb)) {
        aux = 'AVOIR'; // rather AVOIR if not specified
      } else {
        let err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `aux property must be set with ${tense} for ${verb}`;
        throw err;
      }
    } else if (aux != 'AVOIR' && aux != 'ETRE') {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `aux must be AVOIR or ETRE`;
      throw err;
    }

    const tempsAux: string = tense === 'PASSE_COMPOSE' ? 'P' : 'I'; // présent ou imparfait
    var conjugatedAux: string = getLocalVerbInfo(aux === 'AVOIR' ? 'avoir' : 'être')[tempsAux][person];
    var participePasseList: string[] = verbInfo['K'];

    if (!participePasseList) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no participe passé for ${verb}`;
      throw err;
    }

    const mappingGenderNumber = { MS: 0, MP: 1, FS: 2, FP: 3 };
    const indexGenderNumber: number = mappingGenderNumber[agreeGender + agreeNumber];
    var participePasse: string = participePasseList[indexGenderNumber];
    // debug(`${agreeGender+agreeNumber} ${indexGenderNumber}`);

    /* istanbul ignore if */
    if (!participePasse) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no participe passé form for ${verb}`;
      throw err;
    }

    conjugated = `${conjugatedAux} ${participePasse}`;
  } else {
    var indexTemps = tenseMapping[tense];

    var tenseInLib = verbInfo[indexTemps];
    if (!tenseInLib) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${tense} tense not available in French for ${verb}`;
      throw err;
    }

    var formInLib = tenseInLib[person];
    if (!formInLib || formInLib === 'NA') {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `person ${person} not available in French for ${verb} in ${tense}`;
      throw err;
    }

    conjugated = formInLib;
  }

  if (pronominal) {
    const pronominalMapping: string[] = ['me', 'te', 'se', 'nous', 'vous', 'se'];
    var contract = false;

    if ([0, 1, 2, 5].indexOf(person) > -1) {
      // potential contraction

      const voyelles = 'aeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ'; // toutesVoyellesMinMaj
      var startsWithVoyelle = RegExp(`^[${voyelles}]`);
      if (startsWithVoyelle.test(conjugated)) {
        contract = true;
      } else if (conjugated.startsWith('h') && !isHAspire(verb)) {
        // take infinitive, not conjugated form
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
