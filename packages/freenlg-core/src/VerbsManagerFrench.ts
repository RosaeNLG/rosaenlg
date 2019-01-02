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

import { GenderNumberManager } from "./GenderNumberManager";
import { FrenchVerbs } from "./FrenchVerbs";

export class VerbsManagerFrench {
  
  genderNumberManager: GenderNumberManager;
  frenchVerbs: FrenchVerbs;
    
  constructor(params:any) {

    this.genderNumberManager = params.genderNumberManager;

    if (params.loadDicts!=false) {
      this.frenchVerbs = new FrenchVerbs;
    }
  }

  getConjugation(verb: string, tense: string, person: number, verbInfo: any): string {
    //console.log(verb);
    const availableTenses = [
      'PRESENT', 'FUTUR', 'IMPARFAIT', 'PASSE_SIMPLE', 
      'CONDITIONNEL_PRESENT', 'IMPERATIF_PRESENT', 'SUBJONCTIF_PRESENT', 'SUBJONCTIF_IMPARFAIT',
      'PASSE_COMPOSE', 'PLUS_QUE_PARFAIT'
    ];

    if (availableTenses.indexOf(tense)==-1) {
      console.log(`ERROR: ${tense} not available in French`);
      return '';
    }

    var verbInLib: Array<Array<string>> = this.frenchVerbs.getVerb(verb);
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

    
    if (tense=='PASSE_COMPOSE' || tense=='PLUS_QUE_PARFAIT') {
      var aux: string = verbInfo.aux;
      if (aux==null) {
        console.log(`ERROR: aux property must be set with ${tense}`);
        return '';
      } else if (aux!='AVOIR' && aux!='ETRE') {
        console.log('ERROR: aux must be AVOIR or ETRE');
        return '';
      }

      const tempsAux: string = tense=='PASSE_COMPOSE' ? 'P' : 'I'; // présent ou imparfait
      var conjugatedAux: string = this.frenchVerbs.getVerb(aux=='AVOIR' ? 'avoir' : 'être')[tempsAux][person];
      var participePasseList: Array<string> = verbInLib['K'];

      if (participePasseList==null) {
        console.log(`ERROR: no PARTICIPE_PASSE for ${verb}}`);
        return '';
      }


      var agreeWith: any = verbInfo.agree;
      if (agreeWith==null) {
        agreeWith = this.genderNumberManager.getAnonymous('M','S');
      }
      const gender: string = this.genderNumberManager.getRefGender(agreeWith);
      const number: string = this.genderNumberManager.getRefNumber(agreeWith);

      const mappingGenderNumber: any = { 'MS': 0, 'MP': 1, 'FS': 2, 'FP': 3 };
      const indexGenderNumber: number = mappingGenderNumber[ gender+number ];
      var participePasse: string = participePasseList[ indexGenderNumber ];
      if (participePasse==null) {
        console.log(`ERROR: no PARTICIPE_PASSE form for ${verb}}`);
        return '';
      }
            
      return `${conjugatedAux} ${participePasse}`;
      

    } else {

      var indexTemps = tenseMapping[tense];

      var tenseInLib = verbInLib[indexTemps];
      if (tenseInLib==null) {
        console.log(`ERROR: ${tense} not available in French for ${verb}`);
        return '';
      }
  
      var formInLib = tenseInLib[person];
      if (formInLib==null || formInLib=='NA') {
        console.log(`ERROR: ${person} not available in French for ${verb} in ${tense}`);
        return '';
      }
  
      return formInLib;  
    }

  
  }      

}
