/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VerbInfoPerson {
  1: string;
  2: string;
  3: string;
}
export interface VerbInfoTense {
  S: VerbInfoPerson;
  P: VerbInfoPerson;
}
export interface VerbInfoImp {
  S: string;
  P: string;
}
export interface VerbInfo {
  INF: string;
  PA1: string;
  PA2: string[];
  KJ1: VerbInfoTense;
  KJ2: VerbInfoTense;
  PRÄ: VerbInfoTense;
  PRT: VerbInfoTense;
  IMP: VerbInfoImp;
}
export interface VerbsInfo {
  [key: string]: VerbInfo;
}
