import fs = require('fs');

import * as Debug from "debug";
const debug = Debug("german-verbs");


let verbsList: any;

function getVerbsList(): string[][][] {
  // lazy loading
  if (verbsList!=null) {
    // debug('did not reload');
  } else {
    // debug('load');
    verbsList = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/verbs.json', 'utf8'));
  }

  return verbsList;
}

function getVerbData(verb:string): string[][] {
  if (verb==null) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }

  var verbInLib: Array<Array<string>> = getVerbsList()[verb];
  if (verbInLib==null) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict`;
    throw err;
  }

  return verbInLib;
}

// exported only to ease testing
export function getReflexiveFormPronoun(
    pronominalCase:'ACC'|'DAT',
    person: 1|2|3,
    number:'S'|'P'
  ): string {

  // we only care for pronominalCase for S1 or S2
  if (  number=='S' 
    &&  (person==1 || person==2) 
    &&  (pronominalCase!='ACC' && pronominalCase!='DAT') ) {

    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `pronominalCase ACC or DAT required for S 1 or 2`;
    throw err;
  }

  const pronouns:any = {
    'ACC': {
      'S': {
        1: 'mich',
        2: 'dich',
        3: 'sich'
      },
      'P': {
        1: 'uns',
        2: 'euch',
        3: 'sich'
      }
    },
    'DAT': {
      'S': {
        1: 'mir',
        2: 'dir',
        3: 'sich'
      },
      'P': {
        1: 'uns',
        2: 'euch',
        3: 'sich'
      }
    }
  }

  return pronouns[pronominalCase || 'ACC'][number][person];
}

// exported only to ease testing
export function getReflexiveCase(verb:string):'ACC'|'DAT' {
  const accList:string[] = 
  [ 'abkühlen',
    'abheben',
    'amüsieren',
    'ärgern',
    'bewegen',
    'ergeben',
    'erholen',
    'freuen',
    'setzen',
    'sonnen',
    'treffen',
    'umwenden',
    'verabschieden',
    'verfahren' ];
  
  const datList:string[] = 
  [ 'denken',
    'kaufen',
    'anziehen' ];
  
  if (accList.includes(verb)) {
    return 'ACC';
  } else if (datList.includes(verb)) {
    return 'DAT';
  } else {
    return null;
  }
}

/* for PA2 it is better if it contains "ge", as we will use it for partizip, not for passive voice
  geworden	werden	VER:PA2:NON
  worden	werden	VER:PA2:NON

  sometimes no 'ge' form: verzeihen: verziehen verzeiht
*/
export function getPartizip2(verb:string) {

  const verbInLib: string[][] = getVerbData(verb);

  const part2list:string[] = verbInLib['PA2'];

  if (!part2list) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `no Partizip2 found for ${verb}`;
    throw err;
  }

  if (part2list.length==1) {
    return part2list[0];
  } else { // we favor the 'ge' form hier, but it does not always exists
    for (var i=0; i<part2list.length; i++) {
      if (part2list[i].includes('ge')) {
        return part2list[i];
      }
    }
    return part2list[0];
  }


}

const alwaysSein:string[] = [
  'aufwachen',
  'aufwachsen',
  'einziehen',
  'entstehen',
  'fahren',
  'fallen',
  'fliegen',
  'gehen',
  'geschehen',
  'hüpfen',
  'kommen',
  'laufen',
  'passieren',
  'reisen',
  'rennen',
  'springen',
  'steigen',
  'aussteigen',
  'einsteigen',
  'sinken',
  'sterben',
  'wachsen',
  'bleiben',
  'sein',
  'werden',
  'treten',
  'auswandern',
  'begegnen',
  'explodieren',
  'folgen',
  'landen',
  'reisen',
  'starten',
  'wandern',
  'zurückkehren',
  'verbrennen'
];

export function alwaysUsesSein(verb) {
  return alwaysSein.indexOf(verb)>-1;
}

export function getConjugation(
    verb: string,
    tense:    'PRASENS'|'PRATERITUM'|'FUTUR1'|'FUTUR2'|'PERFEKT'
              |'PLUSQUAMPERFEKT'|'KONJUNKTIV1_PRASENS'
              |'KONJUNKTIV1_FUTUR1'|'KONJUNKTIV1_PERFEKT'
              |'KONJUNKTIV2_PRATERITUM'|'KONJUNKTIV2_FUTUR1'|'KONJUNKTIV2_FUTUR2',
    person: 1|2|3,
    number:'S'|'P',
    aux:'SEIN'|'HABEN',
    pronominal:boolean,
    pronominalCase:'ACC'|'DAT'
  ): string[] {

  // check params

  if (number!='S' && number!='P') {
    var err = new Error();
    err.name = 'TypeError';
    err.message = 'number must S or P';
    throw err;    
  }

  const validTenses:string[] = ['PRASENS','PRATERITUM','FUTUR1',
                                'PERFEKT','PLUSQUAMPERFEKT','FUTUR2',
                                'KONJUNKTIV1_PRASENS','KONJUNKTIV1_FUTUR1','KONJUNKTIV1_PERFEKT',
                                'KONJUNKTIV2_PRATERITUM','KONJUNKTIV2_FUTUR1','KONJUNKTIV2_FUTUR2'];
  if (tense==null || validTenses.indexOf(tense)==-1) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = `tense ${tense} err, must be ${validTenses.join()}`;
    throw err;
  }

  const tensesWithAux:string[] = ['PERFEKT','PLUSQUAMPERFEKT','FUTUR2', 
                                  'KONJUNKTIV1_PERFEKT','KONJUNKTIV2_FUTUR2'];
  if (tensesWithAux.indexOf(tense)>-1) {
    if (!aux && this.alwaysUsesSein(verb)) {
      aux = 'SEIN';
    }
    
    if (aux!='SEIN' && aux!='HABEN') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `this tense ${tense} requires aux param with SEIN or HABEN`;
      throw err;
    }
  }


  // do composed tenses
  switch (tense) {
    case 'FUTUR1':
      return [this.getConjugation('werden', 'PRASENS', person, number, null, pronominal, pronominalCase), 
              verb];
    case 'PERFEKT':
      return [this.getConjugation(aux.toLowerCase(), 'PRASENS', person, number, null, pronominal, pronominalCase),
              getPartizip2(verb)];
    case 'PLUSQUAMPERFEKT':
      return [this.getConjugation(aux.toLowerCase(), 'PRATERITUM', person, number, null, pronominal, pronominalCase), 
              getPartizip2(verb)];
    case 'FUTUR2':
      return [this.getConjugation('werden', 'PRASENS', person, number, null, pronominal, pronominalCase), 
              `${getPartizip2(verb)} ${aux.toLowerCase()}`];
    case 'KONJUNKTIV1_FUTUR1':
      return [this.getConjugation('werden', 'KONJUNKTIV1_PRASENS', person, number, null, pronominal, pronominalCase), 
              verb];
    case 'KONJUNKTIV1_PERFEKT':
      return [this.getConjugation(aux.toLowerCase(), 'KONJUNKTIV1_PRASENS', person, number, null, pronominal, pronominalCase), 
              getPartizip2(verb)];
    case 'KONJUNKTIV2_FUTUR1':
      return [this.getConjugation('werden', 'KONJUNKTIV2_PRATERITUM', person, number, null, pronominal, pronominalCase), 
              verb];
    case 'KONJUNKTIV2_FUTUR2':
      return [this.getConjugation('werden', 'KONJUNKTIV1_PRASENS', person, number, null, pronominal, pronominalCase),
              `${getPartizip2(verb)} ${aux.toLowerCase()}`];
  }
  
  // do all other tenses

  // get pronominal pronoun
  const pronominalPronoun:string = pronominal ? getReflexiveFormPronoun(pronominalCase, person, number) : null;

  if (person!=1 && person!=2 && person!=3) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = 'person must 1 2 or 3';
    throw err;
  }

  const verbInLib: string[][] = getVerbData(verb);

  // debug( JSON.stringify(verbInLib) );

  const tenseMapping = {
    'PRASENS': 'PRÄ',
    'PRATERITUM': 'PRT',
    'KONJUNKTIV1_PRASENS': 'KJ1',
    'KONJUNKTIV2_PRATERITUM': 'KJ2',
  }

  // sehen[PRÄ][SIN][1]
  const verbDataTense = verbInLib[tenseMapping[tense]];
  if (verbDataTense==null) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict for ${tense}`;
    throw err;
  }

  const verbDataTenseNumber = verbDataTense[number];
  if (verbDataTenseNumber==null) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict for ${tense} and ${number}`;
    throw err;
  }

  const flexForm = verbDataTenseNumber[person];
  if (flexForm==null) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in german dict for ${tense} and ${number} and ${person}`;
    throw err;
  }

  if (pronominalPronoun==null) {
    return [ flexForm ];
  } else {
    return [ `${flexForm} ${pronominalPronoun}` ];
  }
  
}

