/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdjectiveInfo {
  MS?: string;
  MP: string;
  FS: string;
  FP: string;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}
