import * as compromise from 'compromise';
import { tousCaracteresMinMajRe, stdBetweenWithParenthesis } from './constants';

function getCompromiseValidArticle(input: string): string {
  let nlpRes = compromise(input)
    .nouns()
    .articles();
  // debug( nlpRes[0] );
  return nlpRes != null && nlpRes[0] != null && ['a', 'an'].indexOf(nlpRes[0].article) > -1 ? nlpRes[0].article : null;
}


function redoCapitalization(initial, replacement): string {
  if (initial==='A') {
    return replacement.substring(0,1).toUpperCase() + replacement.substring(1); // A or An...
  } else {
    return replacement;
  }
}

// quite the same as aAn but works when the string is protected
export function aAnBeforeProtect(input: string): string {
  let res = input;
  //console.log('xxx' + input);

  let regexA = new RegExp(`([^${tousCaracteresMinMajRe}])([aA])${stdBetweenWithParenthesis}§([${tousCaracteresMinMajRe}]*)`, 'g');
  res = res.replace(regexA, function(match, before, aA, between, word): string {
    //console.log(`<${before}> <${aA}> <${between}> <${word}>`);

    let compResult = getCompromiseValidArticle(aA + ' ' + word);
    
    if (compResult) {
      let newAa = redoCapitalization(aA, compResult);
      return `${before}${newAa}${between}§${word}`;
    } else {
      // we do nothing
      return match;
    }
  });
  //console.log('yyy' + res);
  return res;
}

export function aAn(input: string): string {
  let res = input;

  let regexA = new RegExp(`([^${tousCaracteresMinMajRe}])([aA])${stdBetweenWithParenthesis}([${tousCaracteresMinMajRe}]*)`, 'g');
  res = res.replace(regexA, function(match, before, aA, between, word): string {
    // debug(`BEFORE PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);

    let compResult = getCompromiseValidArticle(aA + ' ' + word);

    if (compResult) {
      let newAa = redoCapitalization(aA, compResult);
      return `${before}${newAa}${between}${word}`;
    } else {
      // we do nothing
      return match;
    }
  });
  return res;
}

export function enPossessivesBeforeProtect(input: string): string {
  let res = input;
  // debug("xx: "+ input);

  let regexSS = new RegExp("(s\\s*§\\s*'s)([^" + tousCaracteresMinMajRe + '])', 'g');
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
  let regexSS = new RegExp("s([☞☜\\s]*)'s([^" + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexSS, function(match, between, after): string {
    // debug(`${corresp} ${first} ${offset} ${orig}`);
    return `s${between}'${after}`;
  });
  return res;
}
