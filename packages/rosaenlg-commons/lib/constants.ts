export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | 'es_ES' | string;

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
  public readonly stdPunctList = '\\.:!\\?;,…'; // without ¡¿ for Spanish
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

  public constructor(language: Languages) {
    // init order is important
    this.allPunctList = this.getAllPunctList(language);
    this.toutesVoyellesMinuscules = this.getToutesVoyellesMinuscules();
    this.tousCaracteresMinusculesRe = this.getTousCaracteresMinusculesRe();
    this.toutesVoyellesMajuscules = this.toutesVoyellesMinuscules.toUpperCase();
    this.toutesVoyellesMinMaj = this.toutesVoyellesMinuscules + this.toutesVoyellesMajuscules;
    this.tousCaracteresMajusculesRe = this.tousCaracteresMinusculesRe.toUpperCase();
    this.tousCaracteresMinMajRe = this.tousCaracteresMinusculesRe + this.tousCaracteresMajusculesRe + '\\-';
    this.stdBetweenWithParenthesis = `(${this.spaceOrNonBlockingClass}+|$)`;
    this.stdBeforeWithParenthesis = `([\\s¤☛☚☞☜${this.allPunctList}])`;
  }

  private getAllPunctList(language: Languages): string {
    switch (language) {
      case 'es_ES':
        return this.stdPunctList + '¡¿';
      case 'fr_FR':
      case 'en_US':
      case 'it_IT':
      case 'de_DE':
      default:
        return this.stdPunctList;
    }
  }

  private getToutesVoyellesMinuscules(): string {
    let res = voyellesSimplesMinuscules;
    for (let i = 0; i < voyellesSimplesMinuscules.length; i++) {
      res = res + correspondances[voyellesSimplesMinuscules[i]];
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
