import {
  Constants,
  Languages,
  italianIsConsonneImpure,
  italianIsIFollowedByVowel,
  italianStartsWithVowel,
} from 'rosaenlg-commons';

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
      if (italianIsConsonneImpure(word, constants) || italianIsIFollowedByVowel(word, constants)) {
        return getElt(before, 'lo', determiner, between, word);
      } else if (italianStartsWithVowel(word, constants)) {
        return getElt(before, "l'", determiner, between, word);
      } else {
        return getElt(before, 'il', determiner, between, word);
      }
    });
  }

  // definite masc plural
  {
    res = res.replace(getRegex('[Ii]|[Gg]li', constants), function (match, before, determiner, between, word): string {
      if (
        italianIsConsonneImpure(word, constants) ||
        italianStartsWithVowel(word, constants) ||
        word.toLowerCase() === 'dei'
      ) {
        return getElt(before, 'gli', determiner, between, word);
      } else {
        return getElt(before, 'i', determiner, between, word);
      }
    });
  }

  // definite fem sing
  {
    res = res.replace(getRegex('[Ll]a', constants), function (match, before, determiner, between, word): string {
      if (italianStartsWithVowel(word, constants) && !italianIsIFollowedByVowel(word, constants)) {
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
      if (italianIsConsonneImpure(word, constants) || italianIsIFollowedByVowel(word, constants)) {
        return getElt(before, 'uno', determiner, between, word);
      } else {
        return getElt(before, 'un', determiner, between, word);
      }
    });
  }

  // indefinite fem
  {
    res = res.replace(getRegex('[Uu]na', constants), function (match, before, determiner, between, word): string {
      if (italianStartsWithVowel(word, constants) && !italianIsIFollowedByVowel(word, constants)) {
        return getElt(before, "un'", determiner, between, word);
      } else {
        return getElt(before, 'una', determiner, between, word);
      }
    });
  }

  return res;
}
