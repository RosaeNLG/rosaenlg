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


  const tense:string = params.tense;
  const verb:string = params.verb;
  const person:number = params.person;
  const agreeGender: string = params.agreeGender!=null ? params.agreeGender : 'M';
  const agreeNumber:string = params.agreeNumber!=null ? params.agreeNumber : 'S';


  var verbInLib: Array<Array<string>> = getVerbsList()[verb];
  if (verbInLib==null) {
    console.log(`ERROR: ${verb} not in lefff lib`);
    return '';
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
        console.log(`ERROR: aux property must be set with ${tense}`);
        return '';
      }
    } else if (aux!='AVOIR' && aux!='ETRE') {
      console.log('ERROR: aux must be AVOIR or ETRE');
      return '';
    }

    const tempsAux: string = tense=='PASSE_COMPOSE' ? 'P' : 'I'; // présent ou imparfait
    var conjugatedAux: string = getVerbsList()[aux=='AVOIR' ? 'avoir' : 'être'][tempsAux][person];
    var participePasseList: Array<string> = verbInLib['K'];

    if (participePasseList==null) {
      console.log(`ERROR: no PARTICIPE_PASSE for ${verb}}`);
      return '';
    }

    const mappingGenderNumber: any = { 'MS': 0, 'MP': 1, 'FS': 2, 'FP': 3 };
    const indexGenderNumber: number = mappingGenderNumber[ agreeGender+agreeNumber ];
    var participePasse: string = participePasseList[ indexGenderNumber ];
    // console.log(`${agreeGender+agreeNumber} ${indexGenderNumber}`);
    if (participePasse==null) {
      console.log(`ERROR: no PARTICIPE_PASSE form for ${verb}`);
      return '';
    }
          
    conjugated = `${conjugatedAux} ${participePasse}`;
    

  } else {

    var indexTemps = tenseMapping[tense];

    var tenseInLib = verbInLib[indexTemps];
    if (tenseInLib==null) {
      console.log(`ERROR: ${tense} tense not available in French for ${verb}`);
      return '';
    }

    var formInLib = tenseInLib[person];
    if (formInLib==null || formInLib=='NA') {
      console.log(`ERROR: ${person} person not available in French for ${verb} in ${tense}`);
      return '';
    }

    conjugated = formInLib;  
  }

  if (params.pronominal) {
    const pronominalMapping:string[] = ['me', 'te', 'se', 'nous', 'vous', 'se'];
    return `${pronominalMapping[person]} ${conjugated}`;
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
