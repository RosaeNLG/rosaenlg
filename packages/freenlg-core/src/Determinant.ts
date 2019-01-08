
import { getGenderFrenchWord } from "./FrenchWordsGender";
import { getGenderGermanWord } from "./GermanWordsGenderCases";

export function getDet(lang: string, det: string, obj: string, params: any): string {
  if (lang=='en_US') {
    return "TODO_DET_en_US";

  } else if (lang=='de_DE') {

    var gender:string;
    if (params!=null && ['M','F','N'].indexOf(params.gender)>-1) { // gender explicitely set
      gender = params.gender;
    } else {
      gender = getGenderGermanWord(obj);
      if (gender==null) {
        console.log(`ERROR cannot put an article on ${obj}, its gender is not in German dict`);
        return '';
      }  
    }

    const germanCase: string = params!=null && params.case!=null ? params.case : 'NOMINATIVE';
    if (germanCase!='NOMINATIVE' && germanCase!='GENITIVE') {
      console.log(`ERROR ${germanCase} is not a supported German case`);
      return '';
    }
    
    const germanDets = {
      'NOMINATIVE': {
        'DEFINITE': {'M':'der', 'F':'die', 'N':'das'},
        'DEMONSTRATIVE': {'M':'dieser', 'F':'diese', 'N':'dieses'}  
      },
      'GENITIVE': {
        'DEFINITE': {'M':'des', 'F':'der', 'N':'des'},
        'DEMONSTRATIVE': {'M':'dieses', 'F':'dieser', 'N':'dieses'}
      }
    };

    const res:string = germanDets[germanCase][det][gender];
    //console.log(res);
    if ( res==null ) {
      console.log(`ERROR ${det} for ${germanCase} is not supported in de_DE`);
      return '';
    } else {
      return res;
    }

  } else if (lang=='fr_FR') {
    var gender:string;
    if (params!=null && ['M','F'].indexOf(params.gender)>-1) { // gender explicitely set
      gender = params.gender;
    } else {
      gender = getGenderFrenchWord(obj);
      if (gender==null) {
        console.log(`ERROR cannot put an article on ${obj}, its gender is not in French dict`);
        return '';
      }  
    }

    const frenchDets = {
      'DEFINITE': {'M':'le', 'F':'la'},
      'DEMONSTRATIVE': {'M':'ce', 'F':'cette'}
    };
    if ( frenchDets[det]==null ) {
      console.log(`ERROR ${det} is not supported in fr_FR`);
    } else {
      return frenchDets[det][gender];
    }

  }
}
