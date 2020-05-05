import { Constants, Languages } from './constants';

export function isConsonneImpure(word: string, constants: Constants): boolean {
  const wordLc = word.toLowerCase();

  const begins = ['ps', 'pn', 'gn', 'x', 'z'];
  for (let i = 0; i < begins.length; i++) {
    //console.log(`${word} start with ${begins[i]}?`);
    if (wordLc.startsWith(begins[i])) {
      //console.log(`isConsonneImpure ${word}? => true`);
      return true;
    }
  }
  // s impur (autrement dit un s suivi d'une autre consonne)
  const regexSImpur = new RegExp('^s[' + constants.toutesConsonnes + ']');
  if (regexSImpur.test(wordLc)) {
    //console.log(`isConsonneImpure ${word}? => true`);
    return true;
  }
  //console.log(`isConsonneImpure ${word}? => false`);
  return false;
}

export function isIFollowedByVowel(word: string, constants: Constants): boolean {
  const regexISuiviVoyelle = new RegExp('^[IiYy][' + constants.toutesVoyellesMinuscules + ']');
  if (regexISuiviVoyelle.test(word)) {
    return true;
  }
  return false;
}

export function startsWithVowel(word: string, constants: Constants): boolean {
  const regexVowel = new RegExp('^[' + constants.toutesVoyellesMinuscules + ']');
  if (regexVowel.test(word.toLowerCase())) {
    return true;
  }
  return false;
}

function getDetElt(determiner: string, capRef: string, between: string): string {
  const isUc = capRef.substring(0, 1).toLowerCase() != capRef.substring(0, 1);
  const newDet = isUc ? determiner.substring(0, 1).toUpperCase() + determiner.substring(1) : determiner;
  const newBetween = determiner.endsWith("'") ? between.replace(/ /g, '') : between.replace(/\s+/g, ' ');
  return `${newDet}${newBetween}`;
}

function getElt(before: string, determiner: string, capRef: string, between: string, word: string): string {
  return `${before}${getDetElt(determiner, capRef, between)}${word}`;
}

function getRegex(part: string, constants: Constants): RegExp {
  return new RegExp(
    `${constants.stdBeforeWithParenthesis}(${part})${constants.stdBetweenWithParenthesis}([${constants.tousCaracteresMinMajRe}]*)`,
    'g',
  );
}

export function contractions(input: string, _lang: Languages, constants: Constants): string {
  let res = input;

  // definite masc sing
  {
    res = res.replace(getRegex('[Ii]l|[Ll]o', constants), function (match, before, determiner, between, word): string {
      if (isConsonneImpure(word, constants) || isIFollowedByVowel(word, constants)) {
        return getElt(before, 'lo', determiner, between, word);
      } else if (startsWithVowel(word, constants)) {
        return getElt(before, "l'", determiner, between, word);
      } else {
        return getElt(before, 'il', determiner, between, word);
      }
    });
  }

  // definite masc plural
  {
    res = res.replace(getRegex('[Ii]|[Gg]li', constants), function (match, before, determiner, between, word): string {
      if (isConsonneImpure(word, constants) || startsWithVowel(word, constants) || word.toLowerCase() === 'dei') {
        return getElt(before, 'gli', determiner, between, word);
      } else {
        return getElt(before, 'i', determiner, between, word);
      }
    });
  }

  // definite fem sing
  {
    res = res.replace(getRegex('[Ll]a', constants), function (match, before, determiner, between, word): string {
      if (startsWithVowel(word, constants) && !isIFollowedByVowel(word, constants)) {
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
    res = res.replace(getRegex('[Uu]n|[Uu]no', constants), function (match, before, determiner, between, word): string {
      if (isConsonneImpure(word, constants) || isIFollowedByVowel(word, constants)) {
        return getElt(before, 'uno', determiner, between, word);
      } else {
        return getElt(before, 'un', determiner, between, word);
      }
    });
  }

  // indefinite fem
  {
    res = res.replace(getRegex('[Uu]na', constants), function (match, before, determiner, between, word): string {
      if (startsWithVowel(word, constants) && !isIFollowedByVowel(word, constants)) {
        return getElt(before, "un'", determiner, between, word);
      } else {
        return getElt(before, 'una', determiner, between, word);
      }
    });
  }

  return res;
}
