import { getGenderFrenchWord } from 'french-words-gender';
import frenchWordsGenderLefff from 'french-words-gender-lefff';
import { getGenderGermanWord } from 'german-words';
import germanWordsDict from 'german-words-dict';
import { getGenderItalianWord } from 'italian-words';
import italianWordsDict from 'italian-words-dict';
import { Languages, Genders, GendersMF, Numbers } from './NlgLib';
import { WordsData } from 'rosaenlg-pug-code-gen';

//import * as Debug from 'debug';
//const debug = Debug('rosaenlg');

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
    if (!obj) return true;
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  public setRefGenderNumber(obj: any, gender: Genders, number: Numbers): void {
    if (this.isEmptyObj(obj)) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGenderNumber obj should not be empty';
      throw err;
    }
    // dumpRefMap();
    if (gender) {
      this.setRefGender(obj, gender, null);
    }
    if (number) {
      this.setRefNumber(obj, number);
    }
    // debug(`just called setRefGenderNumber on ${JSON.stringify(obj)} ${gender} ${number}`);
    // dumpRefMap();
  }

  public setRefGender(obj: any, genderOrWord: string, params: any): void {
    //console.log(`setRefGenderNumber ${obj} ${genderOrWord}`);

    if (this.isEmptyObj(obj)) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefGender obj should not be empty';
      throw err;
    }
    // dumpRefMap();
    // debug('setRefGender: ' + JSON.stringify(obj).substring(0, 20) + ' => ' + genderOrWord);

    let explicitGender: Genders;
    if (params && params.gender) {
      explicitGender = params.gender;
    }
    if (['M', 'F', 'N'].indexOf(genderOrWord) > -1) {
      explicitGender = genderOrWord as Genders;
    }

    if (explicitGender) {
      switch (this.language) {
        case 'fr_FR': {
          if (explicitGender != 'M' && explicitGender != 'F') {
            const err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F in French, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;
        }
        case 'de_DE': {
          /* istanbul ignore if */
          if (explicitGender != 'M' && explicitGender != 'F' && explicitGender != 'N') {
            const err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F or N in German, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;
        }
        case 'it_IT': {
          /* istanbul ignore if */
          if (explicitGender != 'M' && explicitGender != 'F') {
            const err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F in Italian, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;
        }
        case 'en_US': {
          /* istanbul ignore if */
          if (explicitGender != 'M' && explicitGender != 'F' && explicitGender != 'N') {
            const err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `gender must be M or F or N in English, here is ${explicitGender}`;
            throw err;
          }
          this.refGenderMap.set(obj, explicitGender);
          return;
        }
        default: {
          this.refGenderMap.set(obj, explicitGender);
          return;
        }
      }
    } else if (genderOrWord) {
      // is a word

      switch (this.language) {
        case 'fr_FR': {
          const genderFromFrDict: GendersMF = getGenderFrenchWord(
            this.embeddedWords || frenchWordsGenderLefff,
            genderOrWord,
          );
          this.refGenderMap.set(obj, genderFromFrDict);
          return;
        }
        case 'de_DE': {
          const genderFromDeDict: Genders = getGenderGermanWord(this.embeddedWords || germanWordsDict, genderOrWord);
          this.refGenderMap.set(obj, genderFromDeDict);
          return;
        }
        case 'it_IT': {
          const genderFromItDict: Genders = getGenderItalianWord(this.embeddedWords || italianWordsDict, genderOrWord);
          this.refGenderMap.set(obj, genderFromItDict);
          return;
        }
        case 'en_US':
        default:
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `there is no gender dict for ${this.language}, set gender directly`;
          throw err;
      }
    } else {
      // called with null for instance
      // do nothing
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `setRefGender called on ${JSON.stringify(obj)} with invalid genderOrWord ${genderOrWord}`;
      throw err;
    }

    // dumpRefMap();
  }

  public getRefGender(obj: any, params: WithGender): Genders {
    // debug('getRefGender called on: ' + JSON.stringify(obj));

    const inMainMap: Genders = this.refGenderMap.get(obj);
    if (inMainMap) {
      return inMainMap;
    } else if (typeof obj === 'string') {
      if (params) {
        if (params.gender) {
          return params.gender;
        }
        if (this.language === 'de_DE' && params.genderOwned) {
          return params.genderOwned;
        }
      }

      // debug("trying to find in dict: " + obj);
      switch (this.language) {
        case 'fr_FR':
          return getGenderFrenchWord(this.embeddedWords || frenchWordsGenderLefff, obj);
        case 'de_DE':
          // debug(`will search in dict: ${obj}`);
          return getGenderGermanWord(this.embeddedWords || germanWordsDict, obj);
        case 'it_IT':
          return getGenderItalianWord(this.embeddedWords || italianWordsDict, obj);
      }
    }

    return null;
  }

  public getAnonymous(gender: Genders, number: Numbers): Anon {
    // debug("getAnonymous");
    const obj: Anon = { isAnonymous: true };
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
    if (params) {
      // istanbul ignore else
      if (params.numberOwned) {
        return params.numberOwned;
      } else if (params.number) {
        return params.number;
      }
    }
    return this.refNumberMap.get(obj);
  }

  public setRefNumber(obj: any, number: Numbers): void {
    if (this.isEmptyObj(obj)) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = 'setRefNumber obj should not be empty';
      throw err;
    }
    if (number != 'S' && number != 'P') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `number must be S or P! - here is ${number}`;
      throw err;
    }
    // dumpRefMap();
    this.refNumberMap.set(obj, number);
    // dumpRefMap();
  }
}
