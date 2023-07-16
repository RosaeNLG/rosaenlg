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

export type VerbInfoIndex = 'P' | 'S' | 'Y' | 'I' | 'G' | 'K' | 'J' | 'T' | 'F' | 'C' | 'W';

export interface VerbInfo {
  P?: (string | null)[];
  S?: (string | null)[];
  Y?: (string | null)[];
  I?: (string | null)[];
  G?: (string | null)[];
  K?: (string | null)[];
  J?: (string | null)[];
  T?: (string | null)[];
  F?: (string | null)[];
  C?: (string | null)[];
  W?: (string | null)[];
}
export type VerbsInfo = Record<string, VerbInfo>;
