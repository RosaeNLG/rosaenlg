
import { getGenderFrenchWord } from "french-words-gender";
import { getGenderGermanWord } from "german-words";

export function getDet(lang: string, det: string, obj: string, params: any): string {
  if (lang=='en_US') {
    console.log(`ERROR determiners not implemented in en_US`);
    return '';

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
    if (germanCase!='NOMINATIVE' && germanCase!='GENITIVE' && germanCase!='ACCUSATIVE') {
      console.log(`ERROR ${germanCase} is not a supported German case for determinants`);
      return '';
    }
    
    // https://deutsch.lingolia.com/en/grammar/pronouns/demonstrative-pronouns
    const germanDets = {
      'NOMINATIVE': {
        'DEFINITE': {'M':'der', 'F':'die', 'N':'das'},
        'DEMONSTRATIVE': {'M':'dieser', 'F':'diese', 'N':'dieses'}  
      },
      'ACCUSATIVE': {
        'DEFINITE': {'M':'den', 'F':'die', 'N':'das'},
        'DEMONSTRATIVE': {'M':'diesen', 'F':'diese', 'N':'dieses'}  
      },
      'GENITIVE': {
        'DEFINITE': {'M':'des', 'F':'der', 'N':'des'},
        'DEMONSTRATIVE': {'M':'dieses', 'F':'dieser', 'N':'dieses'}
      }
    };
    if (germanDets[germanCase][det]==null) {
      console.log(`ERROR ${det} is not supported in de_DE`);
      return '';
    }

    const res:string = germanDets[germanCase][det][gender];
    //console.log(res);
    
    /* istanbul ignore if */
    if ( res==null ) {
      console.log(`ERROR ${det} for ${germanCase} is not supported in de_DE`);
      return '';
    } else {
      return res;
    }

  } else if (lang=='fr_FR') {

    var gender:string;
    var number:string;
    if (params!=null && params.number=='P') {
      number = params.number;
    } else {

      if (params!=null && ['M','F'].indexOf(params.gender)>-1) { // gender explicitely set
        gender = params.gender;
      } else {
        gender = getGenderFrenchWord(obj);
        if (gender==null) {
          console.log(`ERROR cannot put an article on ${obj}, its gender is not in French dict`);
          return '';
        }  
      }
    
    }

    const frenchDets = {
      'DEFINITE': {'M':'le', 'F':'la', 'P':'les'},
      'INDEFINITE': {'M':'un', 'F':'une', 'P':'des'},
      'DEMONSTRATIVE': {'M':'ce', 'F':'cette', 'P':'ces'}
    };
    if ( frenchDets[det]==null ) {
      console.log(`ERROR ${det} is not supported in fr_FR`);
      return '';
    } else {
      if (number=='P') {
        return frenchDets[det]['P'];
      } else {
        return frenchDets[det][gender];
      }
    }

  }
}
