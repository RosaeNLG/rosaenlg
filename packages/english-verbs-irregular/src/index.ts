/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EnglishVerbsIrregular {
  [key: string]: EnglishVerbIrregular;
}
export type EnglishVerbIrregular = string[][];
