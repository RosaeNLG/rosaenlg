/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type Genders = 'M' | 'F';

export interface WordInfo {
  G: Genders;
  S?: string; // not present in dict when same as key
  P: string;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}
