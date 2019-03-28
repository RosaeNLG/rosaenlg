import fs = require('fs');

import * as Debug from "debug";
const debug = Debug("german-adjectives");


let adjectives: any;

function load(): void {
  // lazy loading
  if (adjectives!=null) {
    // debug('did not reload');
  } else {
    // debug('load');
    adjectives = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
  }
}

export function agreeGermanAdjective(
    adjective: string, 
    germanCase: 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE', 
    gender: 'M' | 'F' | 'N', 
    number: 'S' | 'P', 
    det: 'DEFINITE' | 'DEMONSTRATIVE'): string {
      
  load();

  if (gender!='M' && gender!='F' && gender!='N') {
    var err = new Error();
    err.name = 'TypeError';
    err.message = `gender must be M F N`;
    throw err;
  }

  if (number!='S' && number!='P') {
    var err = new Error();
    err.name = 'TypeError';
    err.message = `number must be S or P`;
    throw err;
  }

  var adjInfo = adjectives[adjective];
  if (adjInfo==null) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${adjective} adjective is not in German dict`;
    throw err;
  }

  const casesMapping = {
    'NOMINATIVE':'NOM',
    'ACCUSATIVE':'AKK',
    'DATIVE':'DAT',
    'GENITIVE':'GEN'
  }
  if (casesMapping[germanCase]==null) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = `${germanCase} is not a supported German case`;
    throw err;
  }
  var withCase = adjInfo[ casesMapping[germanCase] ];
  
  const detMapping = {
    'DEFINITE': 'DEF',
    'DEMONSTRATIVE': 'DEF',
    'POSSESSIVE': 'DEF'
    // 'NO_DET': 'SOL'
  }
  if (detMapping[det]==null) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = `${det} is not a supported determiner for adjectives`;
    throw err;
  }
  var withDet = withCase[ detMapping[det] ];
  
  if (number=='P') {
    return withDet['P'];
  } else {
    return withDet[gender];
  }

  
}


