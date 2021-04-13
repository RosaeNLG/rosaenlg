/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdjectivesInfo, AdjectiveInfo } from 'german-adjectives-dict';

export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type Genders = 'M' | 'F' | 'N';
export type Numbers = 'S' | 'P';
export type DetTypes = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'NO_DET';

export function getAdjectiveInfo(adjList: AdjectivesInfo, adjective: string): AdjectiveInfo {
  if (!adjList) {
    const errNoList = new Error();
    errNoList.name = 'NotFoundInDict';
    errNoList.message = `you must provide a linguistic resource`;
    throw errNoList;
  }

  if (adjList[adjective]) {
    return adjList[adjective];
  }

  const errNotFound = new Error();
  errNotFound.name = 'NotFoundInDict';
  errNotFound.message = `${adjective} was not found in adjective list`;
  throw errNotFound;
}

function getAdjInfoHelper(
  adjList: AdjectivesInfo,
  adjective: string,
  caseMapped: string,
  detMapped: string,
  gender: Genders,
  number: Numbers,
): string {
  if (adjList && adjList[adjective] && adjList[adjective][caseMapped] && adjList[adjective][caseMapped][detMapped]) {
    const withDet = adjList[adjective][caseMapped][detMapped];
    if (number === 'P' && withDet['P']) {
      return withDet['P'];
    } else if (withDet[gender]) {
      return withDet[gender];
    }
  }
  return null;
}

export function agreeGermanAdjective(
  adjListExceptions: AdjectivesInfo,
  adjList: AdjectivesInfo,
  adjective: string,
  germanCase: GermanCases,
  gender: Genders,
  number: Numbers,
  det: DetTypes,
): string {
  if (!adjListExceptions && !adjList) {
    const errNoList = new Error();
    errNoList.name = 'NotFoundInDict';
    errNoList.message = `you must provide a linguistic resource`;
    throw errNoList;
  }

  if (gender != 'M' && gender != 'F' && gender != 'N') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `gender must be M F N`;
    throw err;
  }

  if (number != 'S' && number != 'P') {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `number must be S or P`;
    throw err;
  }

  const casesMapping = {
    NOMINATIVE: 'NOM',
    ACCUSATIVE: 'AKK',
    DATIVE: 'DAT',
    GENITIVE: 'GEN',
  };
  const caseMapped = casesMapping[germanCase];
  if (!caseMapped) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `${germanCase} is not a supported German case`;
    throw err;
  }

  let detForMapping = det;
  if (det === 'INDEFINITE' && number === 'P') {
    detForMapping = 'NO_DET';
  }
  const detMapping = {
    DEFINITE: 'DEF',
    DEMONSTRATIVE: 'DEF',
    POSSESSIVE: 'DEF',
    INDEFINITE: 'IND',
    NO_DET: 'SOL',
  };
  const detMapped = detMapping[detForMapping];
  if (!detMapped) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `${det} is not a supported determiner for adjectivesInfo`;
    throw err;
  }

  const res =
    getAdjInfoHelper(adjListExceptions, adjective, caseMapped, detMapped, gender, number) ||
    getAdjInfoHelper(adjList, adjective, caseMapped, detMapped, gender, number);
  if (!res) {
    const errNotFound = new Error();
    errNotFound.name = 'NotFoundInDict';
    errNotFound.message = `${adjective} was not found in adjective list`;
    throw errNotFound;
  }
  return res;
}
