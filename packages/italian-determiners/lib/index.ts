export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type DetType = 'DEFINITE' | 'INDEFINITE'; // TODO | 'DEMONSTRATIVE' | 'POSSESSIVE';

export function getDet(detType: DetType, gender: Genders, number: Numbers): string {
  if (detType != 'DEFINITE' && detType != 'INDEFINITE') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `unsuported determiner type: ${detType})`;
    throw err;
  }

  if (gender != 'M' && gender != 'F' && number != 'P') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M or F (unless plural)`;
    throw err;
  }

  if (number != 'S' && number != 'P') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (detType == 'INDEFINITE' && number == 'P') {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `plural invalid for INDEFINITE`;
    throw err;
  }

  const dets = {
    DEFINITE: { M: { S: 'il', P: 'i' }, F: { S: 'la', P: 'le' } },
    INDEFINITE: { M: { S: 'un' }, F: { S: 'una' } },
  };

  return dets[detType][gender][number];
}
