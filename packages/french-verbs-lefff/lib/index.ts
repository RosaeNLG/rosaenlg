/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

/*
  verb > tense > person
  e.g.
  "suivre":{"P":["suis","suis","suit","suivons","suivez","suivent"],"S":["suive","suives","suive","suivions","suiviez","suivent"],"Y":["NA","suis","NA","suivons","suivez","NA"],"I":["suivais","suivais","suivait","suivions","suiviez","suivaient"],"G":["suivant"],"K":["suivi","suivis","suivie","suivies"],"J":["suivis","suivis","suivit","suivîmes","suivîtes","suivirent"],"T":["suivisse","suivisses","suivît","suivissions","suivissiez","suivissent"],"F":["suivrai","suivras","suivra","suivrons","suivrez","suivront"],"C":["suivrais","suivrais","suivrait","suivrions","suivriez","suivraient"],"W":["suivre"]}
*/

export interface VerbInfo {
  P: string[];
  S: string[];
  Y: string[];
  I: string[];
  G: string[];
  K: string[];
  J: string[];
  T: string[];
  F: string[];
  C: string[];
  W: string[];
}
export type VerbsInfo = Record<string, VerbInfo>;
