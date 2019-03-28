
export function getDet(
  detType:'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE',
  germanCase:'NOMINATIVE'|'ACCUSATIVE'|'DATIVE'|'GENITIVE',
  genderOwner:'M'|'F'|'N',
  numberOwner:'S'|'P',
  genderOwned:'M'|'F'|'N',
  numberOwned:'S'|'P') {

  if (genderOwned!='M' && genderOwned!='F' && genderOwned!='N') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `genderOwned must be M or F`;
    throw err;
  }

  if (numberOwned!='S' && numberOwned!='P') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `numberOwned must be S or P`;
    throw err;
  }

  if (germanCase!='NOMINATIVE' && germanCase!='ACCUSATIVE' && germanCase!='DATIVE' && germanCase!='GENITIVE') {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${germanCase} is not a supported German case for determiners`;
    throw err;
  }

  if (detType=='POSSESSIVE') {
  
    if (germanCase!='NOMINATIVE' && germanCase!='GENITIVE') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${germanCase} is not a supported German case for determiners in POSSESSIVE case. Use NOMINATIVE or GENITIVE.`;
      throw err;
    }

    if (numberOwner!='S' && numberOwner!='P') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `numberOwner must be S or P in POSSESSIVE case`;
      throw err;
    }

    if ( numberOwner!='P' && (genderOwner!='M' && genderOwner!='F' && genderOwner!='N' )) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `genderOwner must be M or F in POSSESSIVE case, unless numberOwner is P`;
      throw err;
    }
  
  }

  
  if (detType!='POSSESSIVE') {
    // don't care for genderOwner and numberOwner here

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
      err.message = `${detType} determiner is not supported`;
      throw err;
    }

    if (numberOwned=='P') {
      return germanDets[germanCase][detType]['P'];
    } else {
      return germanDets[germanCase][detType][genderOwned];
    }

  } else {
    
    // https://deutsch.lingolia.com/en/grammar/pronouns/possessive-pronouns
    // to complete cases
    /*
      1. suivant le possesseur :
        M ou N => sein
        F ou P => ihr
      2. se déclinent et s'accordent en genre, en nombre et en cas avec le substantif auquel ils se rapportent 
            (le substantif qui désigne l'objet possédé)
        NOMINATIF :
          sein seine sein
          ihr ihre ihr
          MN => + rien
          FP => + e
        GENITIF :
          MN => + es
          FP => + er
          seines seiner seines
          ihres ihrer ihres
    */

    var base:string;
    if (genderOwner=='F' || numberOwner=='P') {
      base = 'ihr';
    } else { // S, M and N
      base = 'sein';
    }

    var decl:string;
    switch (germanCase) {
      case 'NOMINATIVE':
        if (genderOwned=='F' || numberOwned=='P') {
          decl = 'e';
        } else {  //S, M and N
          decl = '';
        }
        break;
      case 'GENITIVE':
        if (genderOwned=='F' || numberOwned=='P') {
          decl = 'er';
        } else { // S, M and N
          decl = 'es';
        }
        break;
    }

    return `${base}${decl}`;

  }
  
}
