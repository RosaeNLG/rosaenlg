import { getDet as getFrenchDet } from 'french-determiners';
import { getDet as getGermanDet } from 'german-determiners';
import { getDet as getItalianDet, DetType as ItalianDetType, Dist as ItalianDist } from 'italian-determiners';
import { getDet as getEnglishDet, Dist as EnglishDist } from 'english-determiners';
import { getDet as getSpanishDet, Dist as SpanishDist } from 'spanish-determiners';
import { Languages, Genders, GendersMF, Numbers, GermanCases } from './NlgLib';

//import * as Debug from "debug";
//const debug = Debug("rosaenlg");

export type DetTypes = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';

export interface DetParams {
  genderOwned: Genders;
  numberOwned: Numbers;
  genderOwner: Genders;
  numberOwner: Numbers;
  case: GermanCases;
  dist: EnglishDist | SpanishDist;
  after: string; // Spanish only atm
}

export function getDet(lang: Languages, det: DetTypes, params: DetParams): string {
  // debug(`getDet called with: ${JSON.stringify(params)}`);

  switch (lang) {
    case 'en_US':
      return getEnglishDet(
        det,
        params.genderOwner,
        params.numberOwner || 'S',
        params.numberOwned || 'S',
        params.dist as EnglishDist,
      );
    case 'de_DE':
      return getGermanDet(
        det,
        params.case,
        params.genderOwner,
        params.numberOwner || 'S',
        params.genderOwned,
        params.numberOwned || 'S',
      );
    case 'fr_FR':
      return getFrenchDet(det, params.genderOwned as GendersMF, params.numberOwned || 'S', params.numberOwner || 'S');
    case 'it_IT':
      // istanbul ignore next
      return getItalianDet(
        det as ItalianDetType,
        params.genderOwned as GendersMF,
        params.numberOwned || 'S',
        params.dist as ItalianDist,
      ); // || S will be tested when possessives added
    case 'es_ES':
      // istanbul ignore next
      return getSpanishDet(
        det,
        params.genderOwned as Genders,
        params.numberOwned || 'S',
        params.after,
        params.dist as SpanishDist,
      );
    default: {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `determiners not available in ${this.language}`;
      throw err;
    }
  }
}
