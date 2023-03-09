/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export type Genders = 'M' | 'F' | 'N';

/*
 format:
 "DAT":{"SIN":"-"},"GEN":{"SIN":"-"},"AKK":{"SIN":"Hehl"},"G":"N","NOM":{"SIN":"Hehl"}
 "G":"M","NOM":{"SIN":"Fonotypist","PLU":"Fonotypisten"},"AKK":{"PLU":"Fonotypisten","SIN":"Fonotypisten"},"DAT":{"PLU":"Fonotypisten","SIN":"Fonotypisten"},"GEN":{"PLU":"Fonotypisten","SIN":"Fonotypisten"}
 */
export interface WordSinPlu {
  SIN?: string;
  PLU?: string;
}
export interface WordInfo {
  DAT: WordSinPlu;
  GEN: WordSinPlu;
  AKK: WordSinPlu;
  NOM: WordSinPlu;
  G: Genders;
}
export interface WordsInfo {
  [key: string]: WordInfo;
}
