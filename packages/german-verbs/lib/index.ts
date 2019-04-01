/*
https://deutsch.lingolia.com/fr/grammaire/les-temps


KJ1
KJ2

IMP aussi

INF
PA1
PA2
EIZ

*/

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


export function getPartizip2(verb:string) {

  const verbInLib: string[][] = getVerbData(verb);

  const part = verbInLib['PA2'];

  if (!part) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `no Partizip2 found for ${verb}`;
    throw err;
  }

  return part;

}


export function getConjugation(
    verb: string,
    tense:    'PRASENS'|'PRATERITUM'|'FUTUR1'|'FUTUR2'|'PERFEKT'
              |'PLUSQUAMPERFEKT'|'KONJUNKTIV1_PRASENS'
              |'KONJUNKTIV1_FUTUR1'|'KONJUNKTIV1_PERFEKT'
              |'KONJUNKTIV2_PRATERITUM'|'KONJUNKTIV2_FUTUR1'|'KONJUNKTIV2_FUTUR2',
    person: 1|2|3,
    number:'S'|'P',
    aux:'SEIN'|'HABEN'
  ): string {

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
  if ( tensesWithAux.indexOf(tense)>-1 && (aux!=='SEIN' && aux!=='HABEN')) {    
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `this tense ${tense} requires aux param with SEIN or HABEN`;
    throw err;
  }

  // do composed tenses
  switch (tense) {
    case 'FUTUR1':
      return `${this.getConjugation('werden', 'PRASENS', person, number)} ${verb}`
    case 'PERFEKT':
      return `${this.getConjugation(aux.toLowerCase(), 'PRASENS', person, number)} ${getPartizip2(verb)}`;
    case 'PLUSQUAMPERFEKT':
      return `${this.getConjugation(aux.toLowerCase(), 'PRATERITUM', person, number)} ${getPartizip2(verb)}`;
    case 'FUTUR2':
      return `${this.getConjugation('werden', 'PRASENS', person, number)} ${getPartizip2(verb)} ${aux.toLowerCase()}`;
    case 'KONJUNKTIV1_FUTUR1':
      return `${this.getConjugation('werden', 'KONJUNKTIV1_PRASENS', person, number)} ${verb}`;
    case 'KONJUNKTIV1_PERFEKT':
      return `${this.getConjugation(aux.toLowerCase(), 'KONJUNKTIV1_PRASENS', person, number)} ${getPartizip2(verb)}`;
    case 'KONJUNKTIV2_FUTUR1':
      return `${this.getConjugation('werden', 'KONJUNKTIV2_PRATERITUM', person, number)} ${verb}`;
    case 'KONJUNKTIV2_FUTUR2':
      return `${this.getConjugation('werden', 'KONJUNKTIV1_PRASENS', person, number)} ${getPartizip2(verb)} ${aux.toLowerCase()}`;
  }
  
  // do all other tenses

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

  return flexForm;  
  
}

