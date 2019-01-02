import fs = require('fs');
import { GenderNumberManager } from "./GenderNumberManager";

import * as compromise from "compromise";

let frenchVerbs: any;

export class VerbsManager {
  language: string;
  genderNumberManager: GenderNumberManager;
  spy: Spy;
  frenchVerbs: any;
  
  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;
  
    if (this.language=='fr_FR' && params.loadDicts!=false) {
      if (frenchVerbs!=null) {
        console.log('DID NOT RELOAD FR VERBS');
        this.frenchVerbs = frenchVerbs;
      } else {
        console.log('LOAD FR VERBS');
        this.frenchVerbs = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/fr_FR/conjugations.json', 'utf8'));
        frenchVerbs = this.frenchVerbs;
      }
    }

  }
  

  getAgreeVerb(subject: any, verbInfo: string | any): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_VERB';
    } else {
  
      const verbName: string = typeof verbInfo === 'string' ? verbInfo : verbInfo.verb;
      if (verbName==null) { 
        console.log("ERROR: verb needed.");
        return '';
      }
  
      const tense: string = ( typeof verbInfo === 'string' || verbInfo.tense==null ) ? 'PRESENT' : verbInfo.tense;
      //console.log('verb=' + verbName + ' tense=' + tense + ' params: ' + JSON.stringify(verbInfo));
  
      const number: string = this.genderNumberManager.getRefNumber(subject);
      let person;
      if (number=='P') {
        person = 5;
      } else {
        person = 2;
      }
  
      return this.getConjugation(verbName, tense, person);
    }
  }
  
  
  
  getConjugation(verb: string, tense: string, person: number): string {
    switch (this.language) {
      case 'en_US':
        return this.getConjugation_en_US(verb, tense, person);
      case 'fr_FR':
        return this.getConjugation_fr_FR(verb, tense, person);
    }
  }
  
  
  getConjugation_en_US(verb: string, tense: string, person: number): string {
    // console.log( this.compromise(verb).verbs().conjugate() );
    //console.log('TENSE: ' + tense);
    switch(tense) {
      case 'PRESENT':
        if (person!=2) return verb;
        return compromise(verb).verbs().toPresentTense().all().out();
      case 'PAST':
        return compromise(verb).verbs().toPastTense().all().out();
      case 'FUTURE':
        return compromise(verb).verbs().toFutureTense().all().out();
    }
    
  }
  
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

  
  getConjugation_fr_FR(verb: string, tense: string, person: number): string {
    //console.log(verb);

    var verbInLib = this.frenchVerbs[verb];
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
      // 'PARTICIPE_PASSE': 'K', // participe passé
      // 'PARTICIPE_PRESENT': 'G', // participe présent
      // 'INFINITIF': 'W' // infinitif présent
    }

    var indexTemps = tenseMapping[tense];
    if (indexTemps==null) {
      console.log(`ERROR: ${tense} not available in French`);
      return '';
    }

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


