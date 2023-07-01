/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type AdjectiveInfoIndex = 'MS' | 'MP' | 'FS' | 'FP';

export interface AdjectiveInfo {
  MS?: string | null;
  MP: string | null;
  FS: string | null;
  FP: string | null;
}
export interface AdjectivesInfo {
  [key: string]: AdjectiveInfo;
}
