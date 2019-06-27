import * as compromise from 'compromise';
import { tousCaracteresMinMajRe } from './constants';

function getCompromiseValidArticle(input: string): string {
  let nlpRes = compromise(input)
    .nouns()
    .articles();
  // debug( nlpRes[0] );
  return nlpRes != null && nlpRes[0] != null && ['a', 'an'].indexOf(nlpRes[0].article) > -1 ? nlpRes[0].article : null;
}

// quite the same as aAn but works when the string is protected
export function aAnBeforeProtect(input: string): string {
  let res = input;
  // debug("xx: "+ input);

  let regexA = new RegExp('[^' + tousCaracteresMinMajRe + '](([aA])\\s*§([' + tousCaracteresMinMajRe + ']*))', 'g');
  res = res.replace(regexA, function(corresp, first, second, third): string {
    // debug(`BEFORE PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);

    let compResult = getCompromiseValidArticle(second + ' ' + third);

    if (compResult) {
      let replacement: string = compResult + ' ' + third;
      return corresp.substring(0, 1) + second + '§' + replacement.substring(1);
    } else {
      // we do nothing
      return corresp;
    }
  });
  return res;
}

export function aAn(input: string): string {
  let res = input;
  // debug("xx: "+ input);

  let regexA = new RegExp('[^' + tousCaracteresMinMajRe + '](([aA])\\s+([' + tousCaracteresMinMajRe + ']*))', 'g');
  res = res.replace(regexA, function(corresp, first, second, third): string {
    // debug(`AFTER PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);

    // if it worked we use it, otherwise we do nothing
    // we catch third because compromise lib can change the text : AI->ai but we want to keep AI
    let compResult: string = getCompromiseValidArticle(first);

    if (compResult) {
      let replacement = `${compResult} ${third}`;
      // we keep the first char which was just before the 'a'
      // and we keep the caps (a or A)
      return corresp.substring(0, 1) + second + replacement.substring(1);
    } else {
      return corresp;
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

  let regexSS = new RegExp("(s's)([^" + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexSS, function(corresp, first, second): string {
    // debug(`${corresp} ${first} ${offset} ${orig}`);
    return `s'${second}`;
  });
  return res;
}
