import { DictManager } from 'rosaenlg-commons';
import anList from 'english-a-an-list';
import { getAAn } from 'english-a-an';
import { Constants, Languages } from 'rosaenlg-commons';

function redoCapitalization(initial: string, replacement: string): string {
  if (initial === 'A') {
    return replacement.substring(0, 1).toUpperCase() + replacement.substring(1); // A or An...
  } else {
    return replacement;
  }
}

function aAnGeneric(
  input: string,
  _lang: Languages,
  constants: Constants,
  beforeProtect: boolean,
  dictManager: DictManager,
): string {
  let res = input;
  //console.log('xxx' + input);

  const regexA = new RegExp(
    `([^${constants.tousCaracteresMinMajRe}])([aA])${constants.stdBetweenWithParenthesis}(${constants.getInBetween(
      beforeProtect,
    )})([${constants.tousCaracteresMinMajRe}]*)`,
    'g',
  );
  res = res.replace(regexA, function (match, before, aA, between, beforeWord, word): string {
    // console.log(`BEFORE PROTECT <${before}> <${aA}> <${between}> <${word}>`);
    if (word != null && word != '') {
      // can be null when orphan "a" at the very end of a text
      const newAa = redoCapitalization(aA, getAAn(dictManager.getAdjsWordsData(), anList, word));
      return `${before}${newAa}${between}${beforeWord}${word}`;
    } else {
      return match;
    }
  });
  //console.log('yyy' + res);
  return res;
}

export function aAnBeforeProtect(
  input: string,
  _lang: Languages,
  constants: Constants,
  dictManager: DictManager,
): string {
  return aAnGeneric(input, _lang, constants, true, dictManager);
}
export function aAn(input: string, _lang: Languages, constants: Constants, dictManager: DictManager): string {
  return aAnGeneric(input, _lang, constants, false, dictManager);
}

export function enPossessivesBeforeProtect(input: string, _lang: Languages, constants: Constants): string {
  let res = input;
  // console.log("xx: "+ input);

  const regexSS = new RegExp("(s\\s*§[\\s¤]*'s)([^" + constants.tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexSS, function (corresp, first, second): string {
    // console.log(`AAAA ${corresp} ${first} ${offset} ${orig}`);
    return `s§' ${second}`;
  });
  // console.log("yy: "+ res);
  return res;
}

export function enPossessives(input: string, _lang: Languages, constants: Constants): string {
  let res = input;
  // console.log("xx: "+ input);

  // the <b>earrings</b> 's size => The <b>earrings</b>' size
  const regexSS = new RegExp("s([☞☜\\s]*)'s([^" + constants.tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexSS, function (match, between, after): string {
    // console.log(`${corresp} ${first} ${offset} ${orig}`);
    return `s${between}'${after}`;
  });
  return res;
}
