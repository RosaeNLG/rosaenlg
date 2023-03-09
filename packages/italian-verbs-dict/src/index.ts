/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VerbsInfo {
  [key: string]: VerbInfo;
}
// mode -> tense -> properties
// cannot use Record<Mode, VerbInfoMode> as impr is optional e.g. abboffare
export interface VerbInfo {
  ger?: VerbInfoMode;
  inf?: VerbInfoMode;
  impr?: VerbInfoMode;
  cond?: VerbInfoMode;
  ind?: VerbInfoMode;
  part?: VerbInfoMode;
  sub?: VerbInfoMode;
}

export interface VerbInfoMode {
  pres?: VerbInfoTense | string; // inf pres and ger pres: single string
  past?: VerbInfoTense;
  impf?: VerbInfoTense;
  fut?: VerbInfoTense;
}

export interface VerbInfoTense {
  [key: string]: string;
}
