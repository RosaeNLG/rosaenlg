/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VerbInfoPerson {
  1?: string | string[];
  2?: string | string[];
  3?: string | string[];
}
export interface VerbInfoTense {
  S?: VerbInfoPerson;
  P?: VerbInfoPerson;
}
export interface VerbInfoImp {
  S?: string;
  P?: string;
}

export interface VerbInfo {
  hasPrefix: boolean | undefined;
  INF?: string;
  PA1?: string;
  EIZ?: string;
  PA2?: string[];
  KJ1?: VerbInfoTense;
  KJ2?: VerbInfoTense;
  PRÄ?: VerbInfoTense;
  PRT?: VerbInfoTense;
  IMP?: VerbInfoImp;
}
export interface VerbsInfo {
  [key: string]: VerbInfo;
}
