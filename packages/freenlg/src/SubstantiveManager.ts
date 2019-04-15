import { GenderNumberManager } from "./GenderNumberManager";
import { getCaseGermanWord } from "german-words";

import * as compromise from "compromise";
import * as plural from "pluralize-fr";

import * as Debug from "debug";
const debug = Debug("freenlg");


export class SubstantiveManager {
  language: string;
  genderNumberManager: GenderNumberManager;
  spy: Spy;
  embeddedWords:any;

  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;
  
  }

  private getSubstantive_en_US(subst: string, number: 'S'|'P'): string {
    if (number=='S') {
      return subst;
    } else {
      // maybe we could have a more efficient way to call the lib here?
      return compromise(subst).nouns().toPlural().all().out();
    }
  }
  
  // todo, or not todo?
  private getSubstFeminine_fr_FR(subst: string): string {
    return subst;
  }
  
  private getSubstPlural_fr_FR(subst: string): string {
    return plural(subst);
  }
  
  private getSubstantive_fr_FR(subst: string, gender: 'M'|'F', number: 'S'|'P'): string {
    // debug(`getSubstantive_fr_FR on ${subst} gender ${gender} number ${number}`);
    let withGender: string = gender=='F' ? this.getSubstFeminine_fr_FR(subst) : subst;
    let withNumber: string = number=='P' ? this.getSubstPlural_fr_FR(withGender) : withGender;
    return withNumber;
  }

  private getSubstantive_de_DE(subst: string, number: 'S'|'P', germanCase: 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE'): string {

    // in this (very specific, too specific?...) case it's ok if not in dict
    if ( this.language=='de_DE' && germanCase=='NOMINATIVE' && number=='S') {
      return subst;
    } else {
      return getCaseGermanWord(subst, germanCase, number, this.embeddedWords);
    }
  }
  
  getSubstantive(subst: string, subject: string, params: any): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_SUBST';
    } else {
      var gender:'M'|'F'|'N';
      var number:'S'|'P';
      if (subject!=null) {
        gender = this.genderNumberManager.getRefGender(subject, null);
        number = this.genderNumberManager.getRefNumber(subject, null);  
      } else if (params!=null) {
        gender = params.gender;
        number = params.numberOwned;
      }
  
      switch(this.language) {
        case 'en_US':
          return this.getSubstantive_en_US(subst, number);
        case 'de_DE':
          return this.getSubstantive_de_DE(subst, number, params.case);
        case 'fr_FR':
          return this.getSubstantive_fr_FR(subst, <'M'|'F'> gender, number);
        }
    }
  }
  
}

