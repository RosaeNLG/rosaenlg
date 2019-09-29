export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type Dist = 'NEAR' | 'FAR';
export type DetType = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE'; // TODO | 'POSSESSIVE';

export function getDet(detType: DetType, gender: Genders, number: Numbers, dist: Dist): string {
  if (detType != 'DEFINITE' && detType != 'INDEFINITE' && detType != 'DEMONSTRATIVE') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `unsuported determiner type: ${detType})`;
    throw err;
  }

  if (gender != 'M' && gender != 'F' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `gender must be M or F (unless plural)`;
    throw err;
  }

  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `number must be S or P`;
    throw err;
  }

  if (detType === 'INDEFINITE' && number === 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `plural invalid for INDEFINITE`;
    throw err;
  }

  switch (detType) {
    case 'DEMONSTRATIVE':
      if (!dist) {
        dist = 'NEAR';
      } else if (dist != 'NEAR' && dist != 'FAR') {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `dist must be NEAR or FAR, here ${dist}`;
        throw err;
      }
      const dem = {
        NEAR: { MS: 'questo', MP: 'questi', FS: 'questa', FP: 'queste' },
        FAR: { MS: 'quello', MP: 'quelli', FS: 'quella', FP: 'quelle' },
      };
      return dem[dist][gender + number];

    case 'DEFINITE':
    case 'INDEFINITE':
      const dets = {
        DEFINITE: { MS: 'il', MP: 'i', FS: 'la', FP: 'le' },
        INDEFINITE: { MS: 'un', FS: 'una' },
      };
      return dets[detType][gender + number];
  }
}
