import { getDet as getFrenchDet } from 'french-determiners';
import { getDet as getGermanDet } from 'german-determiners';
import { getDet as getEnglishDet, Dist } from 'english-determiners';
import { Languages, Genders, GendersMF, Numbers, GermanCases } from './NlgLib';

//import * as Debug from "debug";
//const debug = Debug("freenlg");

export type DetTypes = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';

export function getDet(
  lang: Languages,
  det: DetTypes,
  params: {
    genderOwned: Genders;
    numberOwned: Numbers;
    genderOwner: Genders;
    numberOwner: Numbers;
    case: GermanCases;
    dist: Dist;
  },
): string {
  // debug(`getDet called with: ${JSON.stringify(params)}`);

  switch (lang) {
    case 'en_US':
      return getEnglishDet(det, params.genderOwner, params.numberOwner || 'S', params.numberOwned || 'S', params.dist);
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
  }
}
