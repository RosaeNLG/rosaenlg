
export function getDet(
  detType:'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE',
  gender:'M'|'F'|'N',
  number:'S'|'P',
  dist:'NEAR'|'FAR') {

  if ( detType!='DEFINITE' && detType!='INDEFINITE' && detType!='DEMONSTRATIVE' && detType!='POSSESSIVE') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${detType} is not a supported determiner`;
    throw err;
  }

  if ( (detType=='POSSESSIVE') && (gender!='M' && gender!='F' && gender!='N') ) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be F M or N when POSSESSIVE`;
    throw err;
  }

  if (number!='S' && number!='P') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }


  switch(detType) {
    case 'DEFINITE':
      if (number=='S') {
        return 'the';
      } else if (number=='P') {
        return '';
      }

    case 'INDEFINITE':
      if (number=='S') {
        return 'a';
      } else if (number=='P') {
        return '';
      }

    case 'DEMONSTRATIVE':
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

    case 'POSSESSIVE':
      if (number=='S') {
        switch (gender) {
          case 'M':
            return 'his';
          case 'F':
            return 'her';
          case 'N':
            return 'its';
        }
      } else if (number=='P') {
        return'their';
      }

  }


}
