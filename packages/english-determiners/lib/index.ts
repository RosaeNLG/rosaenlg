export type Genders = 'M' | 'F' | 'N';
export type Numbers = 'S' | 'P';
export type Dist = 'NEAR' | 'FAR';
export type DetType = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';

export function getDet(
  detType: DetType,
  genderOwner: Genders,
  numberOwner: Numbers,
  numberOwned: Numbers,
  dist: Dist,
  forceArticlePlural: boolean,
): string {
  if (detType != 'DEFINITE' && detType != 'INDEFINITE' && detType != 'DEMONSTRATIVE' && detType != 'POSSESSIVE') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${detType} is not a supported determiner`;
    throw err;
  }

  if (detType === 'POSSESSIVE') {
    if (numberOwner != 'P' && genderOwner != 'M' && genderOwner != 'F' && genderOwner != 'N') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `genderOwner must be F M or N when POSSESSIVE (unless numberOwner is P)`;
      throw err;
    }
    if (numberOwner != 'S' && numberOwner != 'P') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `numberOwner must be S or P when POSSESSIVE`;
      throw err;
    }
  } else {
    if (numberOwned != 'S' && numberOwned != 'P') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `numberOwned must be S or P`;
      throw err;
    }
  }

  switch (detType) {
    case 'DEFINITE':
      switch (numberOwned) {
        case 'S': {
          return 'the';
        }
        case 'P': {
          if (forceArticlePlural) {
            return 'the';
          } else {
            return '';
          }
        }
      }

    case 'INDEFINITE':
      switch (numberOwned) {
        case 'S': {
          return 'a';
        }
        case 'P': {
          return '';
        }
      }

    case 'DEMONSTRATIVE':
      if (!dist) {
        dist = 'NEAR';
      } else if (dist != 'NEAR' && dist != 'FAR') {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `dist must be NEAR or FAR, here ${dist}`;
        throw err;
      }

      switch (numberOwned) {
        case 'S': {
          switch (dist) {
            case 'NEAR': {
              return 'this';
            }
            case 'FAR': {
              return 'that';
            }
          }
        }
        case 'P': {
          switch (dist) {
            case 'NEAR': {
              return 'these';
            }
            case 'FAR': {
              return 'those';
            }
          }
        }
      }

    case 'POSSESSIVE':
      switch (numberOwner) {
        case 'S': {
          switch (genderOwner) {
            case 'M':
              return 'his';
            case 'F':
              return 'her';
            case 'N':
              return 'its';
          }
        }
        case 'P': {
          return 'their';
        }
      }
  }
}
