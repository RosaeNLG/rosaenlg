import { toutesConsonnes, toutesVoyellesMinuscules, tousCaracteresMinMajRe } from './constants';

export function isConsonneImpure(word: string): boolean {
  let wordLc = word.toLowerCase();

  const begins = ['ps', 'pn', 'gn', 'x', 'z'];
  for (let i = 0; i < begins.length; i++) {
    //console.log(`${word} start with ${begins[i]}?`);
    if (wordLc.startsWith(begins[i])) {
      //console.log(`isConsonneImpure ${word}? => true`);
      return true;
    }
  }
  // s impur (autrement dit un s suivi d'une autre consonne)
  let regexSImpur = new RegExp('^s[' + toutesConsonnes + ']');
  if (regexSImpur.test(wordLc)) {
    //console.log(`isConsonneImpure ${word}? => true`);
    return true;
  }
  //console.log(`isConsonneImpure ${word}? => false`);
  return false;
}

export function isIFollowedByVowel(word: string): boolean {
  let regexISuiviVoyelle = new RegExp('^[IiYy][' + toutesVoyellesMinuscules + ']');
  if (regexISuiviVoyelle.test(word)) {
    return true;
  }
  return false;
}

export function startsWithVowel(word: string): boolean {
  let regexVowel = new RegExp('^[' + toutesVoyellesMinuscules + ']');
  if (regexVowel.test(word.toLowerCase())) {
    return true;
  }
  return false;
}

export function contractions(input: string): string {
  let res = input;

  // definite masc sing
  {
    let regex = new RegExp('(\\s+|p>)([Ii]l|[Ll]o)\\s+([' + tousCaracteresMinMajRe + ']*)', 'g');
    res = res.replace(regex, function(corresp, before, determiner, word): string {
      //console.log(`${before} det:${determiner} ${word}`);
      let isUc = determiner.substring(0, 1).toLowerCase() != determiner.substring(0, 1);
      if (isConsonneImpure(word) || isIFollowedByVowel(word)) {
        //console.log(`lo for ${word} ${isConsonneImpure(word)} ${isIFollowedByVowel(word)}`);
        return `${before}${isUc ? 'L' : 'l'}o ${word}`;
      } else if (startsWithVowel(word)) {
        return `${before}${isUc ? 'L' : 'l'}'${word}`;
      } else {
        return `${before}${isUc ? 'I' : 'i'}l ${word}`;
      }
    });
  }

  // definite masc plural
  {
    let regex = new RegExp('(\\s+|p>)([Ii]|[Gg]li)\\s+([' + tousCaracteresMinMajRe + ']*)', 'g');
    res = res.replace(regex, function(corresp, before, determiner, word): string {
      //console.log(`${before} det:${determiner} ${word}`);
      let isUc = determiner.substring(0, 1).toLowerCase() != determiner.substring(0, 1);
      if (isConsonneImpure(word) || startsWithVowel(word) || word.toLowerCase() == 'dei') {
        return `${before}${isUc ? 'G' : 'g'}li ${word}`;
      } else {
        return `${before}${isUc ? 'I' : 'i'} ${word}`;
      }
    });
  }

  // definite fem sing
  {
    let regex = new RegExp('(\\s+|p>)([Ll]a)\\s+([' + tousCaracteresMinMajRe + ']*)', 'g');
    res = res.replace(regex, function(corresp, before, determiner, word): string {
      //console.log(`${before} det:${determiner} ${word}`);
      let isUc = determiner.substring(0, 1).toLowerCase() != determiner.substring(0, 1);
      if (startsWithVowel(word) && !isIFollowedByVowel(word)) {
        return `${before}${isUc ? 'L' : 'l'}'${word}`;
      } else {
        return `${before}${isUc ? 'L' : 'l'}a ${word}`;
      }
    });
  }

  // definite fem plural
  // nothing to do

  // indefinite masc
  {
    let regex = new RegExp('(\\s+|p>)([Uu]n|[Uu]no)\\s+([' + tousCaracteresMinMajRe + ']*)', 'g');
    res = res.replace(regex, function(corresp, before, determiner, word): string {
      let isUc = determiner.substring(0, 1).toLowerCase() != determiner.substring(0, 1);
      if (isConsonneImpure(word) || isIFollowedByVowel(word)) {
        return `${before}${isUc ? 'U' : 'u'}no ${word}`;
      } else {
        return `${before}${isUc ? 'U' : 'u'}n ${word}`;
      }
    });
  }

  // indefinite fem
  {
    let regex = new RegExp('(\\s+|p>)([Uu]na)\\s+([' + tousCaracteresMinMajRe + ']*)', 'g');
    res = res.replace(regex, function(corresp, before, determiner, word): string {
      let isUc = determiner.substring(0, 1).toLowerCase() != determiner.substring(0, 1);
      if (startsWithVowel(word) && !isIFollowedByVowel(word)) {
        return `${before}${isUc ? 'U' : 'u'}n'${word}`;
      } else {
        return `${before}${isUc ? 'U' : 'u'}na ${word}`;
      }
    });
  }

  return res;
}
