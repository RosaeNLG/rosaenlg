import { Languages, Genders, Numbers } from './NlgLib';
import { WordsData } from 'rosaenlg-pug-code-gen';

// de_DE
import { getGenderGermanWord } from 'german-words';
import germanWordsDict from 'german-words-dict';
// it_IT
import { getGenderItalianWord } from 'italian-words';
import italianWordsDict from 'italian-words-dict';
// fr_FR
import { getGender as getGenderFrenchWord, GenderList as FrenchGenderList } from 'french-words';
import frenchWordsGenderLefff from 'french-words-gender-lefff';
// es_ES
import { getGenderSpanishWord } from 'spanish-words';

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
    // console.log(`just called setRefGenderNumber on ${JSON.stringify(obj)} ${gender} ${number}`);
    // dumpRefMap();
  }

  private getWordGender(word): Genders {
    switch (this.language) {
      case 'fr_FR':
        return getGenderFrenchWord(this.embeddedWords, frenchWordsGenderLefff as FrenchGenderList, word);
      case 'de_DE':
        return getGenderGermanWord(this.embeddedWords || germanWordsDict, word);
      case 'it_IT':
        return getGenderItalianWord(this.embeddedWords || italianWordsDict, word);
      case 'es_ES':
        return getGenderSpanishWord(this.embeddedWords, word);
      case 'en_US':
      default:
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `there is no gender dict for ${this.language}, set gender directly`;
        throw err;
    }
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
    // console.log('setRefGender: ' + JSON.stringify(obj).substring(0, 20) + ' => ' + genderOrWord);

    let explicitGender: Genders;
    if (params && params.gender) {
      explicitGender = params.gender;
    }
    if (['M', 'F', 'N'].indexOf(genderOrWord) > -1) {
      explicitGender = genderOrWord as Genders;
    }

    if (explicitGender) {
      const neutralIsOk = (language: Languages): boolean => {
        if (language == 'fr_FR' || language == 'it_IT') {
          return false;
        }
        // de_DE, en_US and es_ES have neutral, and for other new languages we can't check
        return true;
      };

      if (explicitGender != 'M' && explicitGender != 'F' && !neutralIsOk(this.language)) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invalid neutral gender in ${this.language}`;
        throw err;
      }
      this.refGenderMap.set(obj, explicitGender);
      return;
    } else if (genderOrWord) {
      // is a word
      const gender = this.getWordGender(genderOrWord);
      this.refGenderMap.set(obj, gender);
      return;
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
    // console.log('getRefGender called on: ' + JSON.stringify(obj));

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

      const languagesWithGender = ['fr_FR', 'de_DE', 'it_IT', 'es_ES'];
      if (languagesWithGender.indexOf(this.language) > -1) {
        // we try to get the gender and throw an exception if not found
        return this.getWordGender(obj);
      } else {
        // we don't care
        return null;
      }
    }

    return null;
  }

  public getAnonymous(gender: Genders, number: Numbers): Anon {
    // console.log("getAnonymous");
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

  private getNumberFromObj(obj: any): Numbers {
    if (typeof obj === 'string') {
      if (obj === 'S' || obj === 'P') {
        return obj;
      } else {
        return null;
      }
    } else {
      return this.refNumberMap.get(obj);
    }
  }

  public getRefNumber(obj: any, params: WithNumber): Numbers {
    // numberOwned > number > obj
    if (params) {
      if (params.numberOwned) {
        return this.getNumberFromObj(params.numberOwned);
      } else if (params.number) {
        return this.getNumberFromObj(params.number);
      }
    }

    if (obj != null) {
      return this.getNumberFromObj(obj);
    }
    return null;
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
