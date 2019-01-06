
import { getGenderFrenchWord } from "./FrenchWordsGender";
import { getGenderGermanWord } from "./GermanWordsGenderCases";

export function getDet(lang: string, det: string, obj: string, params: any): string {
  if (lang=='en_US') {
    return "TODO_DET_en_US";

  } else if (lang=='de_DE') {
    var gender:string = getGenderGermanWord(obj);
    if (gender==null) {
      console.log(`ERROR cannot put an article on ${obj}, gender is not in German dict`);
      return '';
    }

    const germanDets = {
      'DEFINITE': {'M':'der', 'F':'die', 'N':'das'},
      'DEMONSTRATIVE': {'M':'dieser', 'F':'diese', 'N':'dieses'}
    };


    if ( germanDets[det]==null ) {
      console.log(`ERROR ${det} is not supported in de_DE`);
    } else {
      var res: string = '';
      res = germanDets[det][gender];
      return `${res} `;
    }

  } else if (lang=='fr_FR') {
    var gender:string = getGenderFrenchWord(obj);
    if (gender==null) {
      console.log(`ERROR cannot put an article on ${obj}, gender is not in French dict`);
      return '';
    }
    const frenchDets = {
      'DEFINITE': {'M':'le', 'F':'la'},
      'DEMONSTRATIVE': {'M':'ce', 'F':'cette'}
    };
    if ( frenchDets[det]==null ) {
      console.log(`ERROR ${det} is not supported in fr_FR`);
    } else {
      var res: string = '';
      res = frenchDets[det][gender];
      return `${res} `;
    }

  }
}
