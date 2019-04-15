import fs = require('fs');

import * as Debug from "debug";
const debug = Debug("german-adjectives");

let adjectives: any;

export function getAdjectiveData(adjective:string, adjSpecificList: any) {
  if (adjSpecificList!=null && adjSpecificList[adjective]!=null) {
    return adjSpecificList[adjective];
  } else {
  // lazy loading
    if (adjectives!=null) {
      // debug('did not reload');
    } else {
      // debug('load');
      try {
        adjectives = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
      } catch(err) {
        // istanbul ignore next
        console.log(`could not read German adjective on disk: ${adjective}`);
        // istanbul ignore next
      }
    }
    return adjectives[adjective];
  }
}

export function agreeGermanAdjective(
    adjective: string, 
    germanCase: 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE', 
    gender: 'M' | 'F' | 'N', 
    number: 'S' | 'P', 
    det: 'DEFINITE' | 'DEMONSTRATIVE',
    adjSpecificList: any): string {

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

  var adjInfo = getAdjectiveData(adjective, adjSpecificList);
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


