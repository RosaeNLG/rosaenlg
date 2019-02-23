
declare var __dirname;

import { getGenderFrenchWord } from "french-words-gender";
import { getGenderGermanWord } from "german-words";

export class GenderNumberManager {

  language: string;
  ref_gender: Map<any, 'M'|'F'|'N'>;
  ref_number: Map<any, 'S'|'P'>;
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

  setRefGenderNumber(obj: any, gender: 'M'|'F'|'N', number: 'S'|'P'): void {
    if (this.isEmptyObj(obj)) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGenderNumber obj should not be empty';
      throw err;
    }
    // dumpRefMap();
    if (gender!=null) {
      this.setRefGender(obj, gender, null);
    }
    if (number!=null) {
      this.setRefNumber(obj, number);
    }
    //console.log(`just called setRefGenderNumber on ${JSON.stringify(obj)} ${gender} ${number}`);
    // dumpRefMap();
  }
  
  
  setRefGender(obj: any, genderOrWord: string, params: any): void {
    if (this.isEmptyObj(obj)) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGender obj should not be empty';
      throw err;
    }
    // dumpRefMap();
    // console.log('setRefGender: ' + JSON.stringify(obj).substring(0, 20) + ' => ' + genderOrWord);

    var explicitGender: 'M'|'F'|'N';
    if (params!=null && params.gender!=null) {
      explicitGender = params.gender;
    }
    if ( ['M','F','N'].indexOf(genderOrWord)>-1 ) {
      explicitGender = <'M'|'F'|'N'> genderOrWord;
    }

    if (explicitGender!=null) {
      switch (this.language) {
        case 'fr_FR':
          if (explicitGender!='M' && explicitGender!='F') {
            var err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F in French, here is ${explicitGender}`;
            throw err;            
          }
          this.ref_gender.set(obj, explicitGender);
          return;
        case 'de_DE':
          /* istanbul ignore if */
          if (explicitGender!='M' && explicitGender!='F' && explicitGender!='N') {
            var err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F or N in German, here is ${explicitGender}`;
            throw err;
          }
          this.ref_gender.set(obj, explicitGender);
          return;
        case 'en_US':
          if (explicitGender!='M') { // M is often used indirectly via getAnonymous
            var err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = 'setRefGender is senseless for English';
            throw err;
          }
          this.ref_gender.set(obj, explicitGender);
          return;
        
        /* istanbul ignore next */
        default:
          var err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `invalid language ${this.language}`;
          throw err;
      }

    } else if (genderOrWord!=null) { // is a word

      switch (this.language) {
        case 'fr_FR':
          var genderFromFrDict:'M'|'F' = getGenderFrenchWord(genderOrWord);
          this.ref_gender.set(obj, genderFromFrDict);
          return;
        case 'de_DE':
          var genderFromDeDict:'M'|'F'|'N' = getGenderGermanWord(genderOrWord);
          this.ref_gender.set(obj, genderFromDeDict);
          return;
        case 'en_US':
          var err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = 'setRefGender is senseless for English - and there is no dict anyway';
          throw err;
      }

    } else { // called with null for instance
      // do nothing
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `setRefGender called on ${JSON.stringify(obj)} with invalid genderOrWord ${genderOrWord}`;
      throw err;      
    }

    // dumpRefMap();
  }
  
  getRefGender(obj: any, params: any): 'M'|'F'|'N' {
    //console.log('getRefGender called on: ' + JSON.stringify(obj));
    
    let inMainMap: 'M'|'F'|'N' = this.ref_gender.get(obj);
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
    
  getAnonymous(gender: 'M'|'F'|'N', number: 'S'|'P'): any {
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

  getRefNumber(obj: any, params: any): 'S'|'P' {
    if (params!=null && params.number!=null) {
      return params.number;
    }
    return this.ref_number.get(obj);
  }
  
  setRefNumber(obj: any, number: 'S'|'P'): void {
    if (this.isEmptyObj(obj)) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefNumber obj should not be empty';
      throw err;
    }
    if (number!='S' && number!='P') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `number must be S or P! - here is ${number}`;
      throw err;
    }
    // dumpRefMap();
    this.ref_number.set(obj, number);
    // dumpRefMap();
  }
      
}
