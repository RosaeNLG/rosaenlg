import fs = require('fs');

//import * as Debug from "debug";
//const debug = Debug("german-adjectivesInfo");

/*
"Dortmunder":{  
   "AKK":{  
      "DEF":{  
         "P":"Dortmunder",
         "F":"Dortmunder",
         "M":"Dortmunder",
         "N":"Dortmunder"
      },
      "IND":{  
         "P":"Dortmunder",
         "F":"Dortmunder",
         "M":"Dortmunder",
         "N":"Dortmunder"
      },
      "SOL":{  
         "P":"Dortmunder",
         "F":"Dortmunder",
         "M":"Dortmunder",
         "N":"Dortmunder"
      }
   },
   "DAT":{  
     ...
   },
   "GEN":{  
    ...
   },
   "NOM":{  
     ...
   }
}
*/
export interface AdjectiveGenderInfo {
  P: string;
  F: string;
  M: string;
  N: string;
}

export interface AdjectiveInfoCase {
  DEF: AdjectiveGenderInfo;
  IND: AdjectiveGenderInfo;
  SOL: AdjectiveGenderInfo;
}

export interface AdjectiveInfo {
  AKK: AdjectiveInfoCase;
  DAT: AdjectiveInfoCase;
  GEN: AdjectiveInfoCase;
  NOM: AdjectiveInfoCase;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

let adjectivesInfo: AdjectivesInfo;

export function getAdjectiveInfo(adjective: string, adjSpecificList: AdjectivesInfo): AdjectiveInfo {
  if (adjSpecificList != null && adjSpecificList[adjective] != null) {
    return adjSpecificList[adjective];
  } else {
    // lazy loading
    if (adjectivesInfo != null) {
      // debug('did not reload');
    } else {
      // debug('load');
      try {
        adjectivesInfo = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/adjectives.json', 'utf8'));
      } catch (err) {
        // istanbul ignore next
        console.log(`could not read German adjective on disk: ${adjective}`);
        // istanbul ignore next
      }
    }
    return adjectivesInfo[adjective];
  }
}

export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type Genders = 'M' | 'F' | 'N';
export type Numbers = 'S' | 'P';
export type DetTypes = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'NO_DET';

export function agreeGermanAdjective(
  adjective: string,
  germanCase: GermanCases,
  gender: Genders,
  number: Numbers,
  det: DetTypes,
  adjSpecificList: AdjectivesInfo,
): string {
  if (gender != 'M' && gender != 'F' && gender != 'N') {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `gender must be M F N`;
    throw err;
  }

  if (number != 'S' && number != 'P') {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `number must be S or P`;
    throw err;
  }

  var adjInfo = getAdjectiveInfo(adjective, adjSpecificList);
  if (adjInfo == null) {
    let err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${adjective} adjective is not in German dict`;
    throw err;
  }

  const casesMapping = {
    NOMINATIVE: 'NOM',
    ACCUSATIVE: 'AKK',
    DATIVE: 'DAT',
    GENITIVE: 'GEN',
  };
  if (casesMapping[germanCase] == null) {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `${germanCase} is not a supported German case`;
    throw err;
  }
  var withCase = adjInfo[casesMapping[germanCase]];

  let detForMapping = det;
  if (det == 'INDEFINITE' && number == 'P') {
    detForMapping = 'NO_DET';
  }

  const detMapping = {
    DEFINITE: 'DEF',
    DEMONSTRATIVE: 'DEF',
    POSSESSIVE: 'DEF',
    INDEFINITE: 'IND',
    NO_DET: 'SOL',
  };

  if (detMapping[detForMapping] == null) {
    let err = new Error();
    err.name = 'TypeError';
    err.message = `${det} is not a supported determiner for adjectivesInfo`;
    throw err;
  }
  var withDet = withCase[detMapping[detForMapping]];

  if (number == 'P') {
    return withDet['P'];
  } else {
    return withDet[gender];
  }
}
