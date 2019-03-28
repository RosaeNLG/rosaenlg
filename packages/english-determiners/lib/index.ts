
export function getDet(
  detType:'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE',
  genderOwner:'M'|'F'|'N',
  numberOwner:'S'|'P',
  numberOwned:'S'|'P',
  dist:'NEAR'|'FAR') {

  if ( detType!='DEFINITE' && detType!='INDEFINITE' && detType!='DEMONSTRATIVE' && detType!='POSSESSIVE') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${detType} is not a supported determiner`;
    throw err;
  }

  if (detType=='POSSESSIVE') {
    if (numberOwner!='P' && (genderOwner!='M' && genderOwner!='F' && genderOwner!='N')) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `genderOwner must be F M or N when POSSESSIVE (unless numberOwner is P)`;
      throw err;
    }
    if (numberOwner!='S' && numberOwner!='P') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `numberOwner must be S or P when POSSESSIVE`;
      throw err;
    }
  } else {
    if (numberOwned!='S' && numberOwned!='P') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `numberOwned must be S or P`;
      throw err;
    }
  }


  switch(detType) {
    case 'DEFINITE':
      if (numberOwned=='S') {
        return 'the';
      } else if (numberOwned=='P') {
        return '';
      }

    case 'INDEFINITE':
      if (numberOwned=='S') {
        return 'a';
      } else if (numberOwned=='P') {
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

      if (numberOwned=='S') {
        if (dist=='NEAR') {
          return 'this';
        } else if (dist=='FAR') {
          return 'that';
        }
      } else if (numberOwned=='P') {
        if (dist=='NEAR') {
          return 'these';
        } else if (dist=='FAR') {
          return 'those';
        }
      }

    case 'POSSESSIVE':
      if (numberOwner=='S') {
        switch (genderOwner) {
          case 'M':
            return 'his';
          case 'F':
            return 'her';
          case 'N':
            return 'its';
        }
      } else if (numberOwner=='P') {
        return'their';
      }

  }


}
