//import * as Debug from "debug";
//const debug = Debug("german-adjectivesInfo");

export interface AdjectiveGenderInfo {
  P: string;
  F: string;
  M: string;
  N: string;
}

export interface AdjectiveInfoCase {
  DEF: AdjectiveGenderInfo;
  IND: AdjectiveGenderInfo;
  SOL: AdjectiveGenderInfo;
}

export interface AdjectiveInfo {
  AKK: AdjectiveInfoCase;
  DAT: AdjectiveInfoCase;
  GEN: AdjectiveInfoCase;
  NOM: AdjectiveInfoCase;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}

export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type Genders = 'M' | 'F' | 'N';
export type Numbers = 'S' | 'P';
export type DetTypes = 'DEFINITE' | 'INDEFINITE' | 'DEMONSTRATIVE' | 'NO_DET';

export function getAdjectiveInfo(adjList: AdjectivesInfo, adjective: string): AdjectiveInfo {
  if (!adjList) {
    const err = new Error();
    err.name = 'NotFoundInDict';
    err.message = `you must provide a linguistic resource`;
    throw err;
  }

  if (adjList[adjective]) {
    return adjList[adjective];
  }

  const err = new Error();
  err.name = 'NotFoundInDict';
  err.message = `${adjective} was not found in adjective list`;
  throw err;
}

export function agreeGermanAdjective(
  adjList: AdjectivesInfo,
  adjective: string,
  germanCase: GermanCases,
  gender: Genders,
  number: Numbers,
  det: DetTypes,
): string {
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

  const adjInfo = getAdjectiveInfo(adjList, adjective);

  const casesMapping = {
    NOMINATIVE: 'NOM',
    ACCUSATIVE: 'AKK',
    DATIVE: 'DAT',
    GENITIVE: 'GEN',
  };
  if (!casesMapping[germanCase]) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `${germanCase} is not a supported German case`;
    throw err;
  }
  const withCase = adjInfo[casesMapping[germanCase]];

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

  if (!detMapping[detForMapping]) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = `${det} is not a supported determiner for adjectivesInfo`;
    throw err;
  }
  const withDet = withCase[detMapping[detForMapping]];

  if (number === 'P') {
    return withDet['P'];
  } else {
    return withDet[gender];
  }
}
