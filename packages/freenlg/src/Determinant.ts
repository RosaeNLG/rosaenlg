
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

  /* istanbul ignore if */
  if (  lang!='en_US' && 
        ( params==null || ['M','F','N'].indexOf(params.gender)==-1 )
    ) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M F or N`;
    throw err;
  }

  /* istanbul ignore if */
  if (params==null || ['S','P'].indexOf(params.number)==-1) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (lang=='en_US') {

    var number:'S'|'P';
    if (params!=null && params.number=='P') {
      number = params.number;
    } else {
      number = 'S';
    }

    // debug(`det en_US ${det} ${number}`);

    if (det=='DEFINITE') {
      if (number=='S') {
        return 'the';
      } else if (number=='P') {
        return '';
      }
    } else if (det=='INDEFINITE') {
      if (number=='S') {
        return 'a';
      } else if (number=='P') {
        return '';
      }
    } else if (det=='DEMONSTRATIVE') {
      var dist:string;
      if (params.dist!=null) {
        if (params.dist=='NEAR' || params.dist=='FAR') {
          dist = params.dist;
        } else {
          var err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `dist must be NEAR or FAR, here ${params.dist}`;
          throw err;
        }
      } else {
        dist = 'NEAR';
      }
      if (number=='S') {
        if (dist=='NEAR') {
          return 'this';
        } else if (dist=='FAR') {
          return 'that';
        }
      } else if (number=='P') {
        if (dist=='NEAR') {
          return 'these';
        } else if (dist=='FAR') {
          return 'those';
        }
      }

    } else {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${det} is not a supported determinant in en_US`;
      throw err;
    }

  } else if (lang=='de_DE') {
    var gender:'M'|'F'|'N';
    gender = params.gender;

    const germanCase: string = params!=null && params.case!=null ? params.case : 'NOMINATIVE';
    if (germanCase!='NOMINATIVE' && germanCase!='GENITIVE' && germanCase!='ACCUSATIVE') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${germanCase} is not a supported German case for determinants`;
      throw err;
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
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${det} is not supported in de_DE`;
      throw err;
    }

    const res:string = germanDets[germanCase][det][gender];
    // debug(res);
    
    /* istanbul ignore if */
    if ( res==null ) {
      var err = new Error();
      err.name = 'NotFoundInDict';
      err.message = `${det} for ${germanCase} is not supported in de_DE`;
      throw err;        
    } else {
      return res;
    }

  } else if (lang=='fr_FR') {

    var gender:'M'|'F'|'N';
    var number:'S'|'P';
    if (params!=null && params.number=='P') {
      number = params.number;
    } else {
      gender = params.gender;    
    }

    const frenchDets = {
      'DEFINITE': {'M':'le', 'F':'la', 'P':'les'},
      'INDEFINITE': {'M':'un', 'F':'une', 'P':'des'},
      'DEMONSTRATIVE': {'M':'ce', 'F':'cette', 'P':'ces'}
    };
    if ( frenchDets[det]==null ) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${det} is not a supported determinant in fr_FR`;
      throw err;
    } else {
      if (number=='P') {
        return frenchDets[det]['P'];
      } else {
        return frenchDets[det][gender];
      }
    }

  }
}
