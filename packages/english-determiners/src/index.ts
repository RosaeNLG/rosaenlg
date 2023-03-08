/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type Genders = 'M' | 'F' | 'N';
export type Numbers = 'S' | 'P';
export type Dist = 'NEAR' | 'FAR';
export type DetType = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'POSSESSIVE';

function checkNumberOwned(numberOwned: Numbers): void {
  if (numberOwned != 'S' && numberOwned != 'P') {
    const err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `numberOwned must be S or P`;
    throw err;
  }
}

function getDefinite(numberOwned: Numbers, forceArticlePlural: boolean): string {
  checkNumberOwned(numberOwned);
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
    // istanbul ignore next
    default:
      return '';
  }
}

function getIndefinite(numberOwned: Numbers): string {
  checkNumberOwned(numberOwned);
  switch (numberOwned) {
    case 'S': {
      return 'a';
    }
    case 'P': {
      return '';
    }
    // istanbul ignore next
    default:
      return '';
  }
}

function getDemonstrative(numberOwned: Numbers, dist: Dist): string {
  checkNumberOwned(numberOwned);

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
        // istanbul ignore next
        default:
          return '';
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
        // istanbul ignore next
        default:
          return '';
      }
    }
    // istanbul ignore next
    default:
      return '';
  }
}

function getPossessive(genderOwner: Genders, numberOwner: Numbers): string {
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
  switch (numberOwner) {
    case 'S': {
      switch (genderOwner) {
        case 'M':
          return 'his';
        case 'F':
          return 'her';
        case 'N':
          return 'its';
        // istanbul ignore next
        default:
          return '';
      }
    }
    case 'P': {
      return 'their';
    }
    // istanbul ignore next
    default:
      return '';
  }
}

export function getDet(
  detType: DetType,
  genderOwner: Genders,
  numberOwner: Numbers,
  numberOwned: Numbers,
  dist: Dist,
  forceArticlePlural: boolean,
): string {
  switch (detType) {
    case 'DEFINITE':
      return getDefinite(numberOwned, forceArticlePlural);
    case 'INDEFINITE':
      return getIndefinite(numberOwned);
    case 'DEMONSTRATIVE':
      return getDemonstrative(numberOwned, dist);
    case 'POSSESSIVE':
      return getPossessive(genderOwner, numberOwner);
    default: {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${detType} is not a supported determiner`;
      throw err;
    }
  }
}
