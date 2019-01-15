import { GenderNumberManager } from "./GenderNumberManager";
import { VerbsManagerFrench } from "./VerbsManagerFrench";

import * as compromise from "compromise";

export class VerbsManager {
  language: string;
  genderNumberManager: GenderNumberManager;
  spy: Spy;
  verbsManagerFrench: VerbsManagerFrench;

  
  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;

    if (this.language=='fr_FR') {
      this.verbsManagerFrench = new VerbsManagerFrench(params);
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
  
      const number: string = this.genderNumberManager.getRefNumber(subject, null);
      let person;
      if (number=='P') {
        person = 5;
      } else {
        person = 2;
      }
  
      return this.getConjugation(verbName, tense, person, typeof verbInfo === 'string' ? null : verbInfo);
    }
  }
  
  
  
  getConjugation(verb: string, tense: string, person: number, verbInfo: any): string {
    switch (this.language) {
      case 'en_US':
        return this.getConjugation_en_US(verb, tense, person, verbInfo);
      case 'fr_FR':
        return this.verbsManagerFrench.getConjugation(verb, tense, person, verbInfo);
    }
  }
  
  
  getConjugation_en_US(verb: string, tense: string, person: number, verbInfo: any): string {
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
    
  
}


