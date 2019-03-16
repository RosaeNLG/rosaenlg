import { getDet as getFrenchDet } from "french-determinants";
import { getDet as getGermanDet } from "german-determinants";
import { getDet as getEnglishDet } from "english-determinants";

import * as Debug from "debug";
const debug = Debug("freenlg");


export function getDet(
    lang: string, 
    det: string, 
    params: {
      gender:'M'|'F'|'N', 
      number:'S'|'P',
      case:string,
      dist: 'NEAR'|'FAR'
    }
    ): string {

  // debug(`getDet called with: ${JSON.stringify(params)}`);

  switch (lang) {
    case 'en_US':
      return getEnglishDet(
        <'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'>det, 
        params.number,
        params.dist);
    case 'de_DE':
      return getGermanDet(
        <'DEFINITE'|'DEMONSTRATIVE'>det, 
        <'NOMINATIVE'|'ACCUSATIVE'|'DATIVE'|'GENITIVE'>params.case, 
        params.gender, 
        params.number);
    case 'fr_FR':
      return getFrenchDet(
        <'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'>det, 
        <'M'|'F'>params.gender, 
        params.number);
  }

}
