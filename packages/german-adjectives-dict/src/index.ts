/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

//export type orDict = 'P' | 'F' | 'M' | 'N';

export interface AdjectiveGenderInfo {
  P: string | null;
  F: string | null;
  M: string | null;
  N: string | null;
}

export type GermanCaseForDict = 'AKK' | 'DAT' | 'GEN' | 'NOM';

export type GermanArticleForDict = 'DEF' | 'IND' | 'SOL';

export interface AdjectiveInfoCase {
  DEF: AdjectiveGenderInfo | null;
  IND: AdjectiveGenderInfo | null;
  SOL: AdjectiveGenderInfo | null;
}

export interface AdjectiveInfo {
  AKK: AdjectiveInfoCase | null;
  DAT: AdjectiveInfoCase | null;
  GEN: AdjectiveInfoCase | null;
  NOM: AdjectiveInfoCase | null;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}
