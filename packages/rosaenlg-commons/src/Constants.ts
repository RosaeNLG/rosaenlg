/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const voyellesSimplesMinuscules = 'aeiouy';

const correspondances = {
  a: 'àáâãäå',
  A: 'ÀÁÂ',
  e: 'èéêë',
  E: 'ÈÉÊË',
  i: 'ìíîï',
  I: 'ÌÍÎÏ',
  o: 'òóôõöø',
  O: 'ÒÓÔÕÖØ',
  u: 'ùúûü',
  U: 'ÙÚÛÜ',
  y: 'ÿ',
  c: 'ç',
  C: 'Ç',
  n: 'ñ',
  N: 'Ñ',
};

export class Constants {
  public readonly toutesConsonnes = 'bcdfghjklmnpqrstvwxz';
  public static stdPunctList = '\\.:!\\?;,…'; // without ¡¿ for Spanish
  public readonly spaceOrNonBlockingClass = '[\\s¤☞☜]';

  public allPunctList: string;
  public toutesVoyellesMinuscules: string;
  public tousCaracteresMinusculesRe: string;
  public toutesVoyellesMajuscules: string;
  public toutesVoyellesMinMaj: string;
  public tousCaracteresMajusculesRe: string;
  public tousCaracteresMinMajRe: string;
  public stdBetweenWithParenthesis: string;
  public stdBeforeWithParenthesis: string;

  public constructor(allPunctList: string) {
    // init order IS IMPORTANT
    this.allPunctList = allPunctList;
    this.toutesVoyellesMinuscules = this.getToutesVoyellesMinuscules();
    this.tousCaracteresMinusculesRe = this.getTousCaracteresMinusculesRe();
    this.toutesVoyellesMajuscules = this.toutesVoyellesMinuscules.toUpperCase();
    this.toutesVoyellesMinMaj = this.toutesVoyellesMinuscules + this.toutesVoyellesMajuscules;
    this.tousCaracteresMajusculesRe = this.tousCaracteresMinusculesRe.toUpperCase();
    this.tousCaracteresMinMajRe = this.tousCaracteresMinusculesRe + '0-9' + this.tousCaracteresMajusculesRe + '\\-';
    this.stdBetweenWithParenthesis = `(${this.spaceOrNonBlockingClass}+|$)`;
    this.stdBeforeWithParenthesis = `([\\s¤☛☚☞☜${this.allPunctList}])`;
  }

  private getToutesVoyellesMinuscules(): string {
    let res = voyellesSimplesMinuscules;
    for (const voyelleSimpleMinuscule of voyellesSimplesMinuscules) {
      res = res + correspondances[voyelleSimpleMinuscule];
    }
    return res;
  }

  private getTousCaracteresMinusculesRe(): string {
    return 'a-z' + this.toutesVoyellesMinuscules;
  }

  public getInBetween(beforeProtect: boolean): string {
    return beforeProtect ? '§[\\s¤]*' : '';
  }
}
