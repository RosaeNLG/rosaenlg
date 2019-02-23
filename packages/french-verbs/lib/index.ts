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
import { isHAspire } from "french-h-muet-aspire";

// verb > tense > person
let verbsList: any;

function getVerbsList(): string[][][] {
  // lazy loading
  if (verbsList!=null) {
    // console.log('DID NOT RELOAD');
  } else {
    // console.log('LOAD');
    verbsList = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/conjugation/conjugations.json', 'utf8'));
  }

  return verbsList;

}


export function getConjugation(
    params: {
      verb: string, 
      person: number,
      pronominal:boolean, 
      aux: 'AVOIR'|'ETRE',
      tense:  'PRESENT' | 'FUTUR' | 'IMPARFAIT' | 'PASSE_SIMPLE'
            | 'CONDITIONNEL_PRESENT' | 'IMPERATIF_PRESENT' 
            | 'SUBJONCTIF_PRESENT' | 'SUBJONCTIF_IMPARFAIT'
            | 'PASSE_COMPOSE' | 'PLUS_QUE_PARFAIT',
      agreeGender:'M'|'F',
      agreeNumber:'S'|'P'
    }): string {

  if (params==null) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = 'main param must not be null';
    throw err;
  }
  if (params.verb==null) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = 'verb must not be null';
    throw err;
  }
  const verb:string = params.verb;

  if (params.person==null) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = 'person must not be null';
    throw err;
  }
  const person:number = params.person;

  const validTenses:string[] = ['PRESENT', 'FUTUR', 'IMPARFAIT', 'PASSE_SIMPLE', 
                                'CONDITIONNEL_PRESENT', 'IMPERATIF_PRESENT', 
                                'SUBJONCTIF_PRESENT', 'SUBJONCTIF_IMPARFAIT', 
                                'PASSE_COMPOSE', 'PLUS_QUE_PARFAIT'];
  if (params.tense==null || validTenses.indexOf(params.tense)==-1) {
    var err = new Error();
    err.name = 'TypeError';
    err.message = `tense must be ${validTenses.join()}`;
    throw err;
  }
  const tense:string = params.tense;

  const agreeGender:string = params.agreeGender!=null ? params.agreeGender : 'M';
  const agreeNumber:string = params.agreeNumber!=null ? params.agreeNumber : 'S';


  var verbInLib: Array<Array<string>> = getVerbsList()[verb];
  if (verbInLib==null) {
    var err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `${verb} not in lefff dict`;
    throw err;
  }


  // console.log( JSON.stringify(verbInLib) );

  const tenseMapping = {
    'PRESENT': 'P', // indicatif présent
    'FUTUR': 'F', // indicatif futur
    'IMPARFAIT': 'I', // indicatif imparfait
    'PASSE_SIMPLE': 'J', // indicatif passé-simple
    'CONDITIONNEL_PRESENT': 'C', // conditionnel présent
    'IMPERATIF_PRESENT': 'Y', // impératif présent
    'SUBJONCTIF_PRESENT': 'S', // subjonctif présent
    'SUBJONCTIF_IMPARFAIT': 'T' // subjonctif imparfait
    //'PARTICIPE_PASSE': 'K', // participe passé
    //'PARTICIPE_PRESENT': 'G', // participe présent
    //'INFINITIF': 'W' // infinitif présent
  }

  var conjugated: string;
  
  if (tense=='PASSE_COMPOSE' || tense=='PLUS_QUE_PARFAIT') {
    var aux: string = params.aux;
    if (aux==null) {
      if (params.pronominal) {
        aux = 'ETRE';
      } else if (alwaysAuxEtre(verb)) {
        aux = 'ETRE';
      } else if(isTransitive(verb)) {
        aux = 'AVOIR'; // rather AVOIR if not specified
      } else {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `aux property must be set with ${tense} for ${verb}`;
        throw err;
      }
    } else if (aux!='AVOIR' && aux!='ETRE') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `aux must be AVOIR or ETRE`;
      throw err;
    }

    const tempsAux: string = tense=='PASSE_COMPOSE' ? 'P' : 'I'; // présent ou imparfait
    var conjugatedAux: string = getVerbsList()[aux=='AVOIR' ? 'avoir' : 'être'][tempsAux][person];
    var participePasseList: Array<string> = verbInLib['K'];

    if (participePasseList==null) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no participe passé for ${verb}`;
      throw err;
    }

    const mappingGenderNumber: any = { 'MS': 0, 'MP': 1, 'FS': 2, 'FP': 3 };
    const indexGenderNumber: number = mappingGenderNumber[ agreeGender+agreeNumber ];
    var participePasse: string = participePasseList[ indexGenderNumber ];
    // console.log(`${agreeGender+agreeNumber} ${indexGenderNumber}`);
    
    /* istanbul ignore if */
    if (participePasse==null) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `no participe passé form for ${verb}`;
      throw err;
    }
          
    conjugated = `${conjugatedAux} ${participePasse}`;
    

  } else {

    var indexTemps = tenseMapping[tense];

    var tenseInLib = verbInLib[indexTemps];
    if (tenseInLib==null) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${tense} tense not available in French for ${verb}`;
      throw err;
    }

    var formInLib = tenseInLib[person];
    if (formInLib==null || formInLib=='NA') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `person ${person} not available in French for ${verb} in ${tense}`;
      throw err;
    }

    conjugated = formInLib;  
  }

  if (params.pronominal) {
    const pronominalMapping:string[] = ['me', 'te', 'se', 'nous', 'vous', 'se'];
    var contract:boolean = false;

    if ([0, 1, 2, 5].indexOf(person)>-1) { // potential contraction
      
      const voyelles: string = 'aeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ'; // toutesVoyellesMinMaj
      var startsWithVoyelle = RegExp(`^[${voyelles}]`);
      if (startsWithVoyelle.test(conjugated)) {
        contract = true;
      } else if (conjugated.startsWith('h') && !isHAspire(verb)) { // take infinitive, not conjugated form
        contract = true;
      }
    }

    if (contract) {
      return `${pronominalMapping[person].substring(0,1)}'${conjugated}`;
    } else {
      return `${pronominalMapping[person]} ${conjugated}`;
    }
        
  } else {
    return conjugated;
  }


}


let listEtre: any;
export function alwaysAuxEtre(verb:string):boolean {
  if (listEtre!=null) {
    //console.log('DID NOT RELOAD');
  } else {
    //console.log('LOAD');
    listEtre = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/etre.json', 'utf8'));
  }
  return listEtre.includes(verb);
}

let listIntransitive: any;
export function isIntransitive(verb:string):boolean {
  if (listIntransitive!=null) {
    //console.log('DID NOT RELOAD');
  } else {
    //console.log('LOAD');
    listIntransitive = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/intransitive.json', 'utf8'));
  }
  return listIntransitive.includes(verb);
}

let listTransitive: any;
export function isTransitive(verb:string):boolean {
  if (listTransitive!=null) {
    //console.log('DID NOT RELOAD');
  } else {
    //console.log('LOAD');
    listTransitive = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/transitive/transitive.json', 'utf8'));
  }

  return listTransitive.includes(verb);
}
