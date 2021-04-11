/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type GendersMF = 'M' | 'F';

export interface GenderList {
  [key: string]: GendersMF;
}
