
export function getDet(
  detType:'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE',
  number:'S'|'P',
  dist:'NEAR'|'FAR') {

  if ( detType!='DEFINITE' && detType!='INDEFINITE' && detType!='DEMONSTRATIVE' ) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${detType} is not a supported determinant`;
    throw err;
  }

  if (number!='S' && number!='P') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (detType=='DEFINITE') {
    if (number=='S') {
      return 'the';
    } else if (number=='P') {
      return '';
    }
  } else if (detType=='INDEFINITE') {
    if (number=='S') {
      return 'a';
    } else if (number=='P') {
      return '';
    }
  } else if (detType=='DEMONSTRATIVE') {
    
    if (dist==null) {
      dist = 'NEAR';
    } else if (dist!='NEAR' && dist!='FAR') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `dist must be NEAR or FAR, here ${dist}`;
      throw err;
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

  }

}
