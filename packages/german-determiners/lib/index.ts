
export function getDet(
  detType:'DEFINITE'|'INDEFINITE'|'DEMONSTRATIVE'|'POSSESSIVE',
  germanCase:'NOMINATIVE'|'ACCUSATIVE'|'DATIVE'|'GENITIVE',
  genderOwner:'M'|'F'|'N',
  genderOwned:'M'|'F'|'N',
  number:'S'|'P') {

  if ( (genderOwned!='M' && genderOwned!='F' && genderOwned!='N') && number!='P' ) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `genderOwned must be M or F (unless plural)`;
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

    if (genderOwner!='M' && genderOwner!='F' && genderOwner!='N') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `In POSSESSIVE det genderOwner is mandatory M F or N`;
      throw err;
    }
  }

  
  if (detType!='POSSESSIVE') {

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

    if (number=='P') {
      return germanDets[germanCase][detType]['P'];
    } else {
      return germanDets[germanCase][detType][genderOwned];
    }

  } else {
    
    // todo plural
    const casePossessiveMap: any = {
      'NOMINATIVE': {
        'M': ['sein', 'seine', 'sein'],
        'F': ['ihr', 'ihre', 'ihr'],
        'N': ['sein', 'seine', 'sein']
      },
      'GENITIVE': {
        'M': ['seines', 'seiner', 'seines'],
        'F': ['ihres', 'ihrer', 'ihres'],
        'N': ['seines', 'seiner', 'seines']
      }
    };
    /*
      1. suivant le genre du possesseur :
        M ou N => sein
        F => ihr
      2. se déclinent et s'accordent en genre, en nombre et en cas avec le substantif auquel ils se rapportent
        NOMINATIF :
          sein seine sein
          ihr ihre ihr
        GENITIF :
          seines seiner seines
          ihres ihrer ihres
    */
    // debug(`${germanCase} ${genderOwner}`);
    
    const ownerMap = casePossessiveMap[germanCase][genderOwner];
    // console.log(`genderOwned: ${genderOwned}`);
    // console.log(JSON.stringify(ownerMap));
    if (genderOwned=='M') {
      return ownerMap[0];
    } else if (genderOwned=='F') {
      return ownerMap[1];
    } else if (genderOwned=='N') {
      return ownerMap[2];
    }
  }
  
}
