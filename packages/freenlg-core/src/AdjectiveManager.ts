import { GenderNumberManager } from "./GenderNumberManager";
import { agree as agreeFrenchAdj } from "french-adjectives";
import { agreeGermanAdjective } from "./GermanAdjectives";

export class AdjectiveManager {

  language: string;
  genderNumberManager: GenderNumberManager;
  spy: Spy;

  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;

  }
  


  agreeAdj(adjective: string, subject: any, params: any): void {
    this.spy.appendDoubleSpace();
    this.spy.appendPugHtml( this.getAgreeAdj(adjective, subject, params) );
    this.spy.appendDoubleSpace();
  }


  getAgreeAdj(adjective: string, subject: any, params: any): string {

    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_ADJ';
    } else {
      let gender: string = this.genderNumberManager.getRefGender(subject, params);
      let number: string = this.genderNumberManager.getRefNumber(subject, params);
      //console.log('agreeAdj:' + ' gender=' + gender + ' number=' + number + ' / ' + adjective + ' / ' + JSON.stringify(subject).substring(0, 20) );

      switch(this.language) {
        case 'en_US':
          // no agreement for adjectives in English
          return adjective;
        case 'fr_FR':
          return agreeFrenchAdj(adjective, gender, number, subject, params!=null && params.adjPos=='BEFORE');
        case 'de_DE':
          return agreeGermanAdjective(adjective, params.case, gender, number, params.det);
        }
    }
  }


}

