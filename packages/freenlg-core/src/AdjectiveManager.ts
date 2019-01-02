import { GenderNumberManager } from "./GenderNumberManager";
import { FrenchAdjectives } from "./FrenchAdjectives";

export class AdjectiveManager {

  language: string;
  genderNumberManager: GenderNumberManager;
  spy: Spy;
  frenchAdjectives: FrenchAdjectives;

  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;

    this.frenchAdjectives = new FrenchAdjectives;
  }
  


  agreeAdj(adjective: string, subject: any): void {
    this.spy.appendDoubleSpace();
    this.spy.appendPugHtml( this.getAgreeAdj(adjective, subject) );
    this.spy.appendDoubleSpace();
  }


  //- test only: mising languages, irregulars etc.
  getAgreeAdj(adjective: string, subject: any): string {

    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_ADJ';
    } else {
      let gender: string = this.genderNumberManager.getRefGender(subject);
      let number: string = this.genderNumberManager.getRefNumber(subject);
      //console.log('agreeAdj:' + ' gender=' + gender + ' number=' + number + ' / ' + adjective + ' / ' + JSON.stringify(subject).substring(0, 20) );

      switch(this.language) {
        case 'en_US':
          return this.getAgreeAdj_en_US(adjective, gender, number);
        case 'fr_FR':
          return this.frenchAdjectives.getAgreeAdj(adjective, gender, number);
      }
    }
  }

  getAgreeAdj_en_US(adjective: string, gender: string, number: string): string {
    // no agreement for adjectives in English
    return adjective;
  }


}

