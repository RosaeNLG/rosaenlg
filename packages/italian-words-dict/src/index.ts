/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type Genders = 'M' | 'F';

export interface WordInfo {
  G: Genders | null;
  S?: string | null; // not present in dict when same as key
  P: string | null;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}
