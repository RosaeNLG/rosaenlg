import { getDet as getFrenchDet } from "french-determiners";
import { getDet as getGermanDet } from "german-determiners";
import { getDet as getEnglishDet } from "english-determiners";

import * as Debug from "debug";
const debug = Debug("freenlg");


export function getDet(
    lang: string, 
    det: string, 
    params: {
      genderOwner:'M'|'F'|'N',
      genderOwned:'M'|'F'|'N',
      number:'S'|'P',
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
        params.number,
        params.dist);
    case 'de_DE':
      return getGermanDet(
        <'DEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE'>det, 
        <'NOMINATIVE'|'ACCUSATIVE'|'DATIVE'|'GENITIVE'>params.case, 
        params.genderOwner,
        params.genderOwned,
        params.number);
    case 'fr_FR':
      return getFrenchDet(
        <'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE'>det, 
        <'M'|'F'>params.genderOwned, 
        params.number);
  }

}
