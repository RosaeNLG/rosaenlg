import { toutesConsonnes, toutesVoyellesMinuscules, tousCaracteresMinMajRe, stdBetweenWithParenthesis, stdBeforeWithParenthesis } from './constants';

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

function getDetElt(determiner:string, capRef:string, between:string): string {
  let isUc = capRef.substring(0, 1).toLowerCase() != capRef.substring(0, 1);
  let newDet = isUc ? determiner.substring(0,1).toUpperCase() + determiner.substring(1) : determiner;
  let newBetween = determiner.endsWith("'") ? between.replace(/ /g, '') : between.replace(/\s+/g, ' ');
  return `${newDet}${newBetween}`;
}

function getElt(before:string, determiner:string, capRef:string, between:string, word:string): string {
  return `${before}${getDetElt(determiner, capRef, between)}${word}`
}

function getRegex(part:string): RegExp {
  return new RegExp(`${stdBeforeWithParenthesis}(${part})${stdBetweenWithParenthesis}([${tousCaracteresMinMajRe}]*)`, 'g');
}

export function contractions(input: string): string {
  let res = input;


  // definite masc sing
  {
    res = res.replace(getRegex('[Ii]l|[Ll]o'), function(match, before, determiner, between, word): string {
      if (isConsonneImpure(word) || isIFollowedByVowel(word)) {
        return getElt(before, 'lo', determiner, between, word);
      } else if (startsWithVowel(word)) {
        return getElt(before, "l'", determiner, between, word);
      } else {
        return getElt(before, 'il', determiner, between, word);
      }
    });
  }

  // definite masc plural
  {
    res = res.replace(getRegex('[Ii]|[Gg]li'), function(match, before, determiner, between, word): string {
      if (isConsonneImpure(word) || startsWithVowel(word) || word.toLowerCase() === 'dei') {
        return getElt(before, 'gli', determiner, between, word);
      } else {
        return getElt(before, 'i', determiner, between, word);
      }
    });
  }

  // definite fem sing
  {
    res = res.replace(getRegex('[Ll]a'), function(match, before, determiner, between, word): string {
      if (startsWithVowel(word) && !isIFollowedByVowel(word)) {
        return getElt(before, "l'", determiner, between, word);
      } else {
        return getElt(before, 'la', determiner, between, word);
      }
    });
  }

  // definite fem plural
  // nothing to do

  // indefinite masc
  {
    res = res.replace(getRegex('[Uu]n|[Uu]no'), function(match, before, determiner, between, word): string {
      if (isConsonneImpure(word) || isIFollowedByVowel(word)) {
        return getElt(before, 'uno', determiner, between, word);
      } else {
        return getElt(before, 'un', determiner, between, word);
      }
    });
  }

  // indefinite fem
  {
    res = res.replace(getRegex('[Uu]na'), function(match, before, determiner, between, word): string {
      if (startsWithVowel(word) && !isIFollowedByVowel(word)) {
        return getElt(before, "un'", determiner, between, word);
      } else {
        return getElt(before, 'una', determiner, between, word);
      }
    });
  }

  return res;
}
