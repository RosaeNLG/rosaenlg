import { GenderNumberManager } from "./GenderNumberManager";

import * as compromise from "compromise";
import * as jslingua from "jslingua";


//- ['TODO', 'TODO', 'TODO', 'TODO', 'TODO', 'TODO']
let verbs_FR: any = {
  'être': {
    INDICATIF_PASSE_COMPOSE: ['été', 'as été', 'a été', 'avons été', 'avez été', 'ont été']
  },
  'pouvoir': {
    PRESENT: ['TODO', 'TODO', 'peut', 'TODO', 'TODO', 'peuvent']
  },
  'faire': {
    PRESENT: ['TODO', 'TODO', 'fait', 'TODO', 'TODO', 'font']
  }
};


export class VerbsManager {
  language: string;
  genderNumberManager: GenderNumberManager;
  frenchConjugator: any;
  spy: Spy;
  
  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;
  
    if (this.language=='fr_FR') {
      this.frenchConjugator = new ( jslingua.getService("Morpho", "fra") )();    
    }
  
  }
  

  getAgreeVerb(subject: any, verbInfo: string | any): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_VERB';
    } else {
  
      const verbName: string = typeof verbInfo === 'string' ? verbInfo : verbInfo.verb;
      if (verbName==null) { console.log("ERROR: verb needed."); }
  
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
  
  
  getConjugation_fr_FR(verb: string, tense: string, person: number): string {
    //console.log(verb);
    
    try {
      // we try the exceptions list first
      return verbs_FR[verb][tense][person];
    } catch (e) {
  
      const tenseMapping = {
        'PRESENT': 'Indicative Present (présent)',
        'INDICATIF_PASSE_COMPOSE': 'Indicative Present perfect (passé composé)'
        // to be completed
      }
  
      let forms = this.frenchConjugator.getForms();
      // console.log(JSON.stringify(forms));
      let form = forms[ tenseMapping[tense] ];
      
      //console.log(JSON.stringify(form));
  
      let opts = Object.assign({}, form, 
        { number: person==2 ? "singular" : "plural" },
        { person: "third" }
      );
  
      //console.log(JSON.stringify(opts));
  
      return this.frenchConjugator.conjugate(verb, opts);
    }
  }
  
}


