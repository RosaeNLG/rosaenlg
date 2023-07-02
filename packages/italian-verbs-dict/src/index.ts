/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VerbsInfo {
  [key: string]: VerbInfo | null;
}

// mode -> tense -> properties

export type VerbInfoModeKey = 'ger' | 'inf' | 'impr' | 'cond' | 'ind' | 'part' | 'sub';

// cannot use Record<Mode, VerbInfoMode> as impr is optional e.g. abboffare
export interface VerbInfo {
  ger: VerbInfoMode | null;
  inf: VerbInfoMode | null;
  impr: VerbInfoMode | null;
  cond: VerbInfoMode | null;
  ind: VerbInfoMode | null;
  part: VerbInfoMode | null;
  sub: VerbInfoMode | null;
}

export type TenseIndex = 'pres' | 'past' | 'impf' | 'fut';

export interface VerbInfoMode {
  pres: VerbInfoTense | string | null; // inf pres and ger pres: single string
  past: VerbInfoTense | null;
  impf: VerbInfoTense | null;
  fut: VerbInfoTense | null;
}

export interface VerbInfoTense {
  [key: string]: string;
}
