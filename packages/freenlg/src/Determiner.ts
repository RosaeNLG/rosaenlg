import { getDet as getFrenchDet } from "french-determiners";
import { getDet as getGermanDet } from "german-determiners";
import { getDet as getEnglishDet } from "english-determiners";

import * as Debug from "debug";
const debug = Debug("freenlg");


export function getDet(
    lang: string, 
    det: string, 
    params: {
      genderOwned:'M'|'F'|'N',
      numberOwned:'S'|'P',
      genderOwner:'M'|'F'|'N',
      numberOwner:'S'|'P',
      case:string,
      dist: 'NEAR'|'FAR'
    }
    ): string {

  // debug(`getDet called with: ${JSON.stringify(params)}`);

  switch (lang) {
    case 'en_US':
      return getEnglishDet(
        <'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE'>det,
        params.genderOwner,
        params.numberOwner || 'S',
        params.numberOwned || 'S',
        params.dist);
    case 'de_DE':
      return getGermanDet(
        <'DEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE'>det, 
        <'NOMINATIVE'|'ACCUSATIVE'|'DATIVE'|'GENITIVE'>params.case, 
        params.genderOwner,
        params.numberOwner || 'S',
        params.genderOwned,
        params.numberOwned || 'S');
    case 'fr_FR':
      return getFrenchDet(
        <'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE'>det, 
        <'M'|'F'>params.genderOwned, 
        params.numberOwned || 'S',
        params.numberOwner || 'S',
        );
  }

}
