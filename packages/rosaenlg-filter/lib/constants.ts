export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | string;

export const allPunctList = '\\.:!\\?;,…';
export const spaceOrNonBlockingClass = '[\\s¤☞☜]';
export const stdBetweenWithParenthesis = `(${spaceOrNonBlockingClass}+|$)`;
export const stdBeforeWithParenthesis = `([\\s¤☛☚☞☜${allPunctList}])`;

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

const voyellesSimplesMinuscules = 'aeiouy';

function getToutesVoyellesMinuscules(): string {
  let res = voyellesSimplesMinuscules;
  for (let i = 0; i < voyellesSimplesMinuscules.length; i++) {
    res = res + correspondances[voyellesSimplesMinuscules[i]];
  }
  return res;
}

export const toutesVoyellesMinuscules: string = getToutesVoyellesMinuscules();

function getTousCaracteresMinusculesRe(): string {
  return 'a-z' + toutesVoyellesMinuscules;
}

const toutesVoyellesMajuscules: string = toutesVoyellesMinuscules.toUpperCase();
export const toutesVoyellesMinMaj: string = toutesVoyellesMinuscules + toutesVoyellesMajuscules;

const tousCaracteresMinusculesRe: string = getTousCaracteresMinusculesRe();
const tousCaracteresMajusculesRe: string = tousCaracteresMinusculesRe.toUpperCase();
export const tousCaracteresMinMajRe: string = tousCaracteresMinusculesRe + tousCaracteresMajusculesRe + '\\-';
export const toutesConsonnes = 'bcdfghjklmnpqrstvwxz';
// debug(tousCaracteresMinusculesRe);
// debug(tousCaracteresMajusculesRe);
// debug(toutesVoyellesMinMaj);
