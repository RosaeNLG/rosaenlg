export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type DetType = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';

export function getDet(detType: DetType, genderOwned: Genders, numberOwned: Numbers, numberOwner: Numbers): string {
  if (detType != 'DEFINITE' && detType != 'INDEFINITE' && detType != 'DEMONSTRATIVE' && detType != 'POSSESSIVE') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `unsuported determiner type: ${detType})`;
    throw err;
  }

  if (detType === 'POSSESSIVE' && (numberOwner != 'S' && numberOwner != 'P')) {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `numberOwner must be S or P when possessive`;
    throw err;
  }

  if (genderOwned != 'M' && genderOwned != 'F' && numberOwned != 'P') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M or F (unless plural)`;
    throw err;
  }

  if (numberOwned != 'S' && numberOwned != 'P') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (detType != 'POSSESSIVE') {
    const frenchDets = {
      DEFINITE: { M: 'le', F: 'la', P: 'les' },
      INDEFINITE: { M: 'un', F: 'une', P: 'des' },
      DEMONSTRATIVE: { M: 'ce', F: 'cette', P: 'ces' },
    };

    if (numberOwned === 'P') {
      return frenchDets[detType]['P'];
    } else {
      return frenchDets[detType][genderOwned];
    }
  } else {
    /*
      Demande à Nicolas de rentrer son ballon et ses patins.
      Demande à Nicolas et à Cédric de rentrer leur ballon et leurs patins.
      https://www.francaisfacile.com/exercices/exercice-francais-2/exercice-francais-42144.php
    */
    switch (numberOwner) {
      case 'S': {
        switch (numberOwned) {
          case 'S': {
            switch (genderOwned) {
              case 'M': {
                return 'son';
              }
              case 'F': {
                return 'sa';
              }
            }
          }
          case 'P': {
            return 'ses';
          }
        }
      }
      case 'P': {
        switch (numberOwned) {
          case 'S': {
            return 'leur';
          }
          case 'P': {
            return 'leurs';
          }
        }
      }
    }
  }
}
