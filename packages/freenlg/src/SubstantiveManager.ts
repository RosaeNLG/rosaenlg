import { GenderNumberManager } from "./GenderNumberManager";

import * as compromise from "compromise";
import * as plural from "pluralize-fr";

export class SubstantiveManager {
  language: string;
  genderNumberManager: GenderNumberManager;
  spy: Spy;


  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;
  
  }

  getSubstantive_en_US(subst: string, gender: string, number: string): string {
    if (number=='S') {
      return subst;
    } else {
      // maybe we could have a more efficient way to call the lib here?
      return compromise(subst).nouns().toPlural().all().out();
    }
  }
  
  // todo, or not todo?
  getSubstFeminine_fr_FR(subst: string): string {
    // return subst + 'E';
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `feminine substantives is not managed in fr_FR`;
    throw err;    
  }
  
  getSubstPlural_fr_FR(subst: string): string {
    return plural(subst);
  }
  
  getSubstantive_fr_FR(subst: string, gender: string, number: string): string {
    //console.log(`getSubstantive_fr_FR on ${subst} gender ${gender} number ${number}`);
    let withGender: string = gender=='F' ? this.getSubstFeminine_fr_FR(subst) : subst;
    let withNumber: string = number=='P' ? this.getSubstPlural_fr_FR(withGender) : withGender;
    return withNumber;
  }
  
  getSubstantive(subst: string, subject: string): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_SUBST';
    } else {
      let gender: string = this.genderNumberManager.getRefGender(subject, null);
      let number: string = this.genderNumberManager.getRefNumber(subject, null);
  
      switch(this.language) {
        case 'en_US':
          return this.getSubstantive_en_US(subst, gender, number);
        case 'fr_FR':
          return this.getSubstantive_fr_FR(subst, gender, number);
        }
    }
  }
  
}

