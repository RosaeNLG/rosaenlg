import { getGenderFrenchWord } from '@freenlg/french-words-gender';
import { getGenderGermanWord } from '@freenlg/german-words';
import { getGenderItalianWord } from '@freenlg/italian-words';
import { Languages, Genders, GendersMF, Numbers } from './NlgLib';
import { WordsData } from '@freenlg/freenlg-pug-code-gen';

//import * as Debug from 'debug';
//const debug = Debug('freenlg');

interface Anon {
  isAnonymous: true;
}

export type RefGenderMap = Map<any, Genders>;
export type RefNumberMap = Map<any, Numbers>;

export interface WithGender {
  gender?: Genders;
  genderOwned?: Genders;
}
export interface WithNumber {
  number?: Numbers;
  numberOwned?: Numbers;
}

export class GenderNumberManager {
  private language: Languages;
  private refGenderMap: RefGenderMap;
  private refNumberMap: RefNumberMap;
  //spy: Spy;
  private embeddedWords: WordsData;

  public constructor(language: Languages) {
    this.refNumberMap = new Map();
    this.refGenderMap = new Map();
    this.language = language;
  }
  public setEmbeddedWords(embeddedWords: WordsData): void {
    this.embeddedWords = embeddedWords;
  }
  public getRefGenderMap(): RefGenderMap {
    return this.refGenderMap;
  }
  public setRefGenderMap(refGenderMap: RefGenderMap): void {
    this.refGenderMap = refGenderMap;
  }
  public getRefNumberMap(): RefNumberMap {
    return this.refNumberMap;
  }
  public setRefNumberMap(refNumberMap: RefNumberMap): void {
    this.refNumberMap = refNumberMap;
  }

  /*
  public setSpy(spy: Spy): void {
    this.spy = spy;
  }
  */

  private isEmptyObj(obj: any): boolean {
    if (obj == null) return true;
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  public setRefGenderNumber(obj: any, gender: Genders, number: Numbers): void {
    if (this.isEmptyObj(obj)) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGenderNumber obj should not be empty';
      throw err;
    }
    // dumpRefMap();
    if (gender != null) {
      this.setRefGender(obj, gender, null);
    }
    if (number != null) {
      this.setRefNumber(obj, number);
    }
    // debug(`just called setRefGenderNumber on ${JSON.stringify(obj)} ${gender} ${number}`);
    // dumpRefMap();
  }

  public setRefGender(obj: any, genderOrWord: string, params: any): void {
    //console.log(`setRefGenderNumber ${obj} ${genderOrWord}`);

    if (this.isEmptyObj(obj)) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGender obj should not be empty';
      throw err;
    }
    // dumpRefMap();
    // debug('setRefGender: ' + JSON.stringify(obj).substring(0, 20) + ' => ' + genderOrWord);

    let explicitGender: Genders;
    if (params != null && params.gender != null) {
      explicitGender = params.gender;
    }
    if (['M', 'F', 'N'].indexOf(genderOrWord) > -1) {
      explicitGender = genderOrWord as Genders;
    }

    if (explicitGender != null) {
      switch (this.language) {
        case 'fr_FR':
          if (explicitGender != 'M' && explicitGender != 'F') {
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F in French, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;
        case 'de_DE':
          /* istanbul ignore if */
          if (explicitGender != 'M' && explicitGender != 'F' && explicitGender != 'N') {
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F or N in German, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;
        case 'it_IT':
          /* istanbul ignore if */
          if (explicitGender != 'M' && explicitGender != 'F') {
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F in Italian, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;
        case 'en_US':
          /* istanbul ignore if */
          if (explicitGender != 'M' && explicitGender != 'F' && explicitGender != 'N') {
            let err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F or N in English, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;

        /* istanbul ignore next */
        default:
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `invalid language ${this.language}`;
          throw err;
      }
    } else if (genderOrWord != null) {
      // is a word

      switch (this.language) {
        case 'fr_FR':
          let genderFromFrDict: GendersMF = getGenderFrenchWord(genderOrWord, this.embeddedWords);
          this.refGenderMap.set(obj, genderFromFrDict);
          return;
        case 'de_DE':
          let genderFromDeDict: Genders = getGenderGermanWord(genderOrWord, this.embeddedWords);
          this.refGenderMap.set(obj, genderFromDeDict);
          return;
        case 'it_IT':
          let genderFromItDict: Genders = getGenderItalianWord(genderOrWord, this.embeddedWords);
          this.refGenderMap.set(obj, genderFromItDict);
          return;
        case 'en_US':
          let err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = 'there is no gender dict in English, set gender directly';
          throw err;
      }
    } else {
      // called with null for instance
      // do nothing
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `setRefGender called on ${JSON.stringify(obj)} with invalid genderOrWord ${genderOrWord}`;
      throw err;
    }

    // dumpRefMap();
  }

  public getRefGender(obj: any, params: WithGender): Genders {
    // debug('getRefGender called on: ' + JSON.stringify(obj));

    let inMainMap: Genders = this.refGenderMap.get(obj);
    if (inMainMap != null) {
      return inMainMap;
    } else if (typeof obj === 'string') {
      if (params != null) {
        if (params.gender != null) {
          return params.gender;
        }
        if (this.language == 'de_DE' && params.genderOwned != null) {
          return params.genderOwned;
        }
      }

      // debug("trying to find in dict: " + obj);
      switch (this.language) {
        case 'fr_FR':
          return getGenderFrenchWord(obj, this.embeddedWords);
        case 'de_DE':
          // debug(`will search in dict: ${obj}`);
          return getGenderGermanWord(obj, this.embeddedWords);
        case 'it_IT':
          return getGenderItalianWord(obj, this.embeddedWords);
      }
    }

    return null;
  }

  public getAnonymous(gender: Genders, number: Numbers): Anon {
    // debug("getAnonymous");
    let obj: Anon = { isAnonymous: true };
    this.setRefGenderNumber(obj, gender, number);
    return obj;
  }

  public getAnonMS(): Anon {
    return this.getAnonymous('M', 'S');
  }
  public getAnonMP(): Anon {
    return this.getAnonymous('M', 'P');
  }
  public getAnonFS(): Anon {
    return this.getAnonymous('F', 'S');
  }
  public getAnonFP(): Anon {
    return this.getAnonymous('F', 'P');
  }

  public getRefNumber(obj: any, params: WithNumber): Numbers {
    if (params != null) {
      // istanbul ignore else
      if (params.numberOwned != null) {
        return params.numberOwned;
      } else if (params.number != null) {
        return params.number;
      }
    }
    return this.refNumberMap.get(obj);
  }

  public setRefNumber(obj: any, number: Numbers): void {
    if (this.isEmptyObj(obj)) {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefNumber obj should not be empty';
      throw err;
    }
    if (number != 'S' && number != 'P') {
      let err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `number must be S or P! - here is ${number}`;
      throw err;
    }
    // dumpRefMap();
    this.refNumberMap.set(obj, number);
    // dumpRefMap();
  }
}
