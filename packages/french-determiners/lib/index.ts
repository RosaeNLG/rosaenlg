
export function getDet(
  detType:'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE',
  gender:'M'|'F', 
  number:'S'|'P') {

  if ( (gender!='M' && gender!='F') && number!='P' ) {
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
    
  const frenchDets = {
    'DEFINITE': {'M':'le', 'F':'la', 'P':'les'},
    'INDEFINITE': {'M':'un', 'F':'une', 'P':'des'},
    'DEMONSTRATIVE': {'M':'ce', 'F':'cette', 'P':'ces'},
    'POSSESSIVE': {'M':'son', 'F':'sa', 'P':'leur'},
  };
  
  if ( frenchDets[detType]==null ) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${detType} is not a supported determiner`;
    throw err;
  } else {
    if (number=='P') {
      return frenchDets[detType]['P'];
    } else {
      return frenchDets[detType][gender];
    }
  }

}
