import anList from 'english-a-an-list';
import { getAAn } from 'english-a-an';
import { tousCaracteresMinMajRe, stdBetweenWithParenthesis } from './constants';

function redoCapitalization(initial: string, replacement: string): string {
  if (initial === 'A') {
    return replacement.substring(0, 1).toUpperCase() + replacement.substring(1); // A or An...
  } else {
    return replacement;
  }
}

// quite the same as aAn but works when the string is protected
export function aAnBeforeProtect(input: string): string {
  let res = input;
  //console.log('xxx' + input);

  const regexA = new RegExp(
    `([^${tousCaracteresMinMajRe}])([aA])${stdBetweenWithParenthesis}§¤*([${tousCaracteresMinMajRe}]*)`,
    'g',
  );
  res = res.replace(regexA, function(match, before, aA, between, word): string {
    // console.log(`BEFORE PROTECT <${before}> <${aA}> <${between}> <${word}>`);
    if (word != null && word != '') {
      // can be null when orphan "a" at the very end of a text
      const newAa = redoCapitalization(aA, getAAn(anList, word));
      return `${before}${newAa}${between}§${word}`;
    } else {
      return match;
    }
  });
  //console.log('yyy' + res);
  return res;
}

export function aAn(input: string): string {
  let res = input;

  const regexA = new RegExp(
    `([^${tousCaracteresMinMajRe}])([aA])${stdBetweenWithParenthesis}([${tousCaracteresMinMajRe}]*)`,
    'g',
  );
  res = res.replace(regexA, function(match, before, aA, between, word): string {
    // console.log(`NORMAL <${input}> <${before}> <${aA}> <${between}> <${word}>`);
    if (word != null && word != '') {
      // can be null when orphan "a" at the very end of a text
      const newAa = redoCapitalization(aA, getAAn(anList, word));
      return `${before}${newAa}${between}${word}`; // NOT the same return as above
    } else {
      return match;
    }
  });
  return res;
}

export function enPossessivesBeforeProtect(input: string): string {
  let res = input;
  // debug("xx: "+ input);

  const regexSS = new RegExp("(s\\s*§[\\s¤]*'s)([^" + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexSS, function(corresp, first, second): string {
    // debug(`AAAA ${corresp} ${first} ${offset} ${orig}`);
    return `s§' ${second}`;
  });
  // debug("yy: "+ res);
  return res;
}

export function enPossessives(input: string): string {
  let res = input;
  // debug("xx: "+ input);

  // the <b>earrings</b> 's size => The <b>earrings</b>' size
  const regexSS = new RegExp("s([☞☜\\s]*)'s([^" + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexSS, function(match, between, after): string {
    // debug(`${corresp} ${first} ${offset} ${orig}`);
    return `s${between}'${after}`;
  });
  return res;
}
