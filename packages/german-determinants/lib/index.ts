
export function getDet(
  detType:'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE',
  germanCase:'NOMINATIVE'|'ACCUSATIVE'|'DATIVE'|'GENITIVE',
  gender:'M'|'F'|'N',
  number:'S'|'P') {

  if ( (gender!='M' && gender!='F' && gender!='N') && number!='P' ) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M or F (unless plural)`;
    throw err;
  }

  if (number!='S' && number!='P') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (germanCase!='NOMINATIVE' && germanCase!='ACCUSATIVE' && germanCase!='DATIVE' && germanCase!='GENITIVE') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${germanCase} is not a supported German case for determinants`;
    throw err;
  }
  
  // https://deutsch.lingolia.com/en/grammar/pronouns/demonstrative-pronouns
  // https://coerll.utexas.edu/gg/gr/pro_07.html
  const germanDets = {
    'NOMINATIVE': {
      'DEFINITE': {'M':'der', 'F':'die', 'N':'das', 'P':'die'},
      'DEMONSTRATIVE': {'M':'dieser', 'F':'diese', 'N':'dieses', 'P':'diese'}
    },
    'ACCUSATIVE': {
      'DEFINITE': {'M':'den', 'F':'die', 'N':'das', 'P':'die'},
      'DEMONSTRATIVE': {'M':'diesen', 'F':'diese', 'N':'dieses', 'P':'diese'}
    },
    'DATIVE': {
      'DEFINITE': {'M':'dem', 'F':'der', 'N':'dem', 'P':'denen'},
      'DEMONSTRATIVE': {'M':'diesem', 'F':'dieser', 'N':'diesem', 'P':'diesen'}
    },
    'GENITIVE': {
      'DEFINITE': {'M':'des', 'F':'der', 'N':'des', 'P':'der'},
      'DEMONSTRATIVE': {'M':'dieses', 'F':'dieser', 'N':'dieses', 'P':'dieser'}
    }
  };
  if (germanDets[germanCase][detType]==null) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${detType} determinant is not supported`;
    throw err;
  }

  if (number=='P') {
    return germanDets[germanCase][detType]['P'];
  } else {
    return germanDets[germanCase][detType][gender];
  }
  
}
