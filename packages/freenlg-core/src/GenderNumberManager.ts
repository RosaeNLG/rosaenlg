
declare var __dirname;

import { getGenderFrenchWord } from "./FrenchWordsGender";
import { getGenderGermanWord } from "./GermanWordsGenderCases";

export class GenderNumberManager {

  language: string;
  ref_gender: Map<any, string>;
  ref_number: Map<any, string>;
  spy: Spy;

  constructor(params) {

    this.ref_number = new Map();
    this.ref_gender = new Map();
    this.language = params.language;
  
  }

  isEmptyObj(obj: any): boolean {
    if (obj==null) return true;
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  setRefGenderNumber(obj: any, gender: string, number: string): void {
    if (this.isEmptyObj(obj)) {
      console.log('ERROR: setRefGenderNumber obj should not be empty!');
      throw new Error("Something unexpected has occurred.");
    }
    // dumpRefMap();
    this.setRefGender(obj, gender, null);
    if (number!=null) {
      this.setRefNumber(obj, number);
    }
    // dumpRefMap();
  }
  
  
  setRefGender(obj: any, genderOrWord: string, params: any): void {
    if (this.isEmptyObj(obj)) {
      console.log('ERROR: setRefGender obj should not be empty!');
      return;
    }
    // dumpRefMap();
    // console.log('setRefGender: ' + JSON.stringify(obj).substring(0, 20) + ' => ' + gender);

    var explicitGender: string;
    if (params!=null && params.gender!=null) {
      explicitGender = params.gender;
    }
    if ( ['M','F','N'].indexOf(genderOrWord)>-1 ) {
      explicitGender = genderOrWord;
    }

    if (explicitGender!=null) {
      switch (this.language) {
        case 'fr_FR':
          if (explicitGender!='M' && explicitGender!='F') {
            console.log('ERROR: gender must be M or F in French!');
            return;
          }
          this.ref_gender.set(obj, explicitGender);
          return;
        case 'de_DE':
          if (explicitGender!='M' && explicitGender!='F' && explicitGender!='N') {
            console.log(`ERROR: gender must be M or F or N in German, here is <${explicitGender}>!`);
            return;
          }
          this.ref_gender.set(obj, explicitGender);
          return;
        case 'en_US':
          if (explicitGender!='M') { // M is often used indirectly via getAnonymous
            console.log(`WARNING setRefGender is not useful for English`);
          }
          this.ref_gender.set(obj, explicitGender);
          return;
      }

    } else if (genderOrWord!=null) { // is a word

      switch (this.language) {
        case 'fr_FR':
          var genderFromDict:string = getGenderFrenchWord(genderOrWord);
          if (genderFromDict==null) {
            console.log(`ERROR could not find the gender of ${genderOrWord} in French dict`);
            return;
          } else {
            this.ref_gender.set(obj, genderFromDict);
            return;
          }
        case 'de_DE':
          var genderFromDict:string = getGenderGermanWord(genderOrWord);
          if (genderFromDict==null) {
            console.log(`ERROR could not find the gender of ${genderOrWord} in German dict`);
            return;
          } else {
            this.ref_gender.set(obj, genderFromDict);
            return;
          }
        case 'en_US':
          console.log(`WARNING setRefGender is not useful for English - and there's no dict anyway`);
          return;
      }

    } else { // called with null for instance
      // do nothing
      return;
    }

    // dumpRefMap();
  }
  
  getRefGender(obj: any, params: any): string {
    //console.log('getRefGender called on: ' + JSON.stringify(obj));
    
    let inMainMap: string = this.ref_gender.get(obj);
    if (inMainMap!=null) {
      return inMainMap;
    } else if (typeof obj === 'string') {

      if (params!=null && params.gender!=null) {
        return params.gender;
      }

      // console.log("trying to find in dict: " + obj);
      switch (this.language) {
        case 'fr_FR':
          return getGenderFrenchWord(obj);
        case 'de_DE':
          //console.log(`will search in dict: ${obj}`);
          return getGenderGermanWord(obj);
      }      
    }
  
    return null;
  }
  
  registerSubst(root: string, gender: string, number: string): void {
    this.setRefGender(root, gender, null);
    this.setRefNumber(root, number);
  }
  
  getAnonymous(gender: string, number: string): any {
    // console.log("getAnonymous");
    let obj: any = {'isAnonymous': true};
    this.setRefGenderNumber(obj, gender, number);
    return obj;
  }

  getAnonMS(): any {
    return this.getAnonymous('M','S');
  }
  getAnonMP(): any {
    return this.getAnonymous('M','P');
  }
  getAnonFS(): any {
    return this.getAnonymous('F','S');
  }
  getAnonFP(): any {
    return this.getAnonymous('F','P');
  }

  getRefNumber(obj: any, params: any): string {
    if (params!=null && params.number!=null) {
      return params.number;
    }
    return this.ref_number.get(obj);
  }
  
  setRefNumber(obj: any, number: string): void {
    if (this.isEmptyObj(obj)) {
      console.log('ERROR: setRefNumber obj should not be empty!');
      return;
    }
    if (number!='S' && number!='P') {
      console.log(`ERROR: number must be S or P! - here is ${number}`);
      return;
    }
    // dumpRefMap();
    this.ref_number.set(obj, number);
    // dumpRefMap();
  }
      
}
