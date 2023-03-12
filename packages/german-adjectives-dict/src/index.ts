/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

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
