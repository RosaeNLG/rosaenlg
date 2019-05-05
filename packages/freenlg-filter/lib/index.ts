import * as compromise from 'compromise';
import { isHAspire } from 'french-h-muet-aspire';

import * as titleCaseEnUs from 'better-title-case';
import * as titleCaseFrFr from 'titlecase-french';

//import * as Debug from 'debug';
//const debug = Debug('freenlg-filter');

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

/*
function getNonAccentue(carRecherche: string): string {
  for (let caractere in correspondances){
    if (correspondances[caractere].indexOf(carRecherche)>-1) { return caractere; }
  }
}
*/

const voyellesSimplesMinuscules = 'aeiouy';

function getToutesVoyellesMinuscules(): string {
  let res = voyellesSimplesMinuscules;
  for (let i = 0; i < voyellesSimplesMinuscules.length; i++) {
    res = res + correspondances[voyellesSimplesMinuscules[i]];
  }
  return res;
}

const toutesVoyellesMinuscules: string = getToutesVoyellesMinuscules();

function getTousCaracteresMinusculesRe(): string {
  return 'a-z' + toutesVoyellesMinuscules;
}

const toutesVoyellesMajuscules: string = toutesVoyellesMinuscules.toUpperCase();
const toutesVoyellesMinMaj: string = toutesVoyellesMinuscules + toutesVoyellesMajuscules;

const tousCaracteresMinusculesRe: string = getTousCaracteresMinusculesRe();
const tousCaracteresMajusculesRe: string = tousCaracteresMinusculesRe.toUpperCase();
const tousCaracteresMinMajRe: string = tousCaracteresMinusculesRe + tousCaracteresMajusculesRe + '\\-';
// debug(tousCaracteresMinusculesRe);
// debug(tousCaracteresMajusculesRe);
// debug(toutesVoyellesMinMaj);

const protectMap = {
  AMPROTECT: '&amp;',
  LTPROTECT: '&lt;',
  GTPROTECT: '&gt;',
};

function applyFilters(input: string, toApply: Function[], language: string): string {
  let res: string = input;
  for (let i = 0; i < toApply.length; i++) {
    res = toApply[i](res, language);
    // debug(`after: ${res}`);
  }
  return res;
}

interface Mappings {
  [key: string]: string;
}

class ProtectMapping {
  public protectedString: string;
  public mappings: Mappings;
  public constructor(protectedString, mappings) {
    this.protectedString = protectedString;
    this.mappings = mappings;
  }
}

function unprotect(toUnprotect: string, mappings: Mappings): string {
  // debug('input: ' + toUnprotect + ' / mappings: ' + JSON.stringify(mappings));
  let res: string = toUnprotect;
  for (let key in mappings) {
    // debug('key/val: ' + key + '/' + mappings[key]);
    res = res.replace(key, mappings[key]);
  }

  return res;
}

function protectHtmlEscapeSeq(input: string): string {
  let res: string = input;
  for (let key in protectMap) {
    res = res.replace(protectMap[key], key);
  }
  return res;
}

function unProtectHtmlEscapeSeq(input: string): string {
  let res: string = input;
  for (let key in protectMap) {
    res = res.replace(key, protectMap[key]);
  }
  return res;
}

function protectBlocks(input: string): ProtectMapping {
  let regexProtect: RegExp = new RegExp('§([^§]*)§', 'g');

  let mappings: Mappings = {};

  let index = 0;
  let protectedInput: string = input.replace(regexProtect, function(corresp, first): string {
    // debug("§§§ :<" + corresp + '>' + first);
    // must not start with E otherwise creates issues with French constractions: d'ESCAPED
    let replacement = 'XESCAPED_SEQ_' + ++index;
    mappings[replacement] = first;
    return replacement;
  });

  // debug('escaped: ' + protectedInput);
  return new ProtectMapping(protectedInput, mappings);
}

function getCompromiseValidArticle(input: string): string {
  let nlpRes = compromise(input)
    .nouns()
    .articles();
  // debug( nlpRes[0] );
  return nlpRes != null && nlpRes[0] != null && ['a', 'an'].indexOf(nlpRes[0].article) > -1 ? nlpRes[0].article : null;
}

// same signature

function joinLines(input: string /*, lang: string*/): string {
  return input.replace(/\n|\r/g, ' ');
}

function titlecase(input: string, lang: string): string {
  let res: string = input;

  const titlecaseFlag = '_TITLECASE_';
  let regexTitlecase: RegExp = new RegExp(`${titlecaseFlag}\\s*(.*?)\\s*${titlecaseFlag}`, 'g');

  res = res.replace(regexTitlecase, function(corresp, first): string {
    // debug("TITLECASE :<" + corresp + '><' + first + '>');
    if (lang == 'en_US') {
      return titleCaseEnUs(first);
    } else if (lang == 'fr_FR') {
      return titleCaseFrFr.convert(first);
    }
  });

  return res;
}

function egg(input: string /*, lang: string*/): string {
  let res: string = input;

  let x = '\x41\x64\x64\x76\x65\x6E\x74\x61';
  let regex: RegExp = new RegExp(x, 'g');
  res = res.replace(regex, x + ' 👍');

  return res;
}

function cleanSpacesPunctuation(input: string, lang: string): string {
  let res: string = input;

  // ['bla ...', 'bla…'],
  res = res.replace(/\.\.\./g, '…');

  // ['bla ! . bla', 'Bla! Bla'],
  res = res.replace(/\s*!\s*\.\s*/g, '!');

  // :
  if (lang == 'en_US' || lang == 'de_DE') {
    res = res.replace(/\s*:\s*/g, ': ');
  } else if (lang == 'fr_FR') {
    res = res.replace(/\s*:\s*/g, ' : ');
  }
  // !
  if (lang == 'en_US' || lang == 'de_DE') {
    res = res.replace(/\s*!/g, '!');
  } else if (lang == 'fr_FR') {
    res = res.replace(/\s*!/g, ' !');
  }
  // ? - same rule as !
  if (lang == 'en_US' || lang == 'de_DE') {
    res = res.replace(/\s*\?/g, '?');
  } else if (lang == 'fr_FR') {
    res = res.replace(/\s*\?/g, ' ?');
  }

  // 2 spaces
  res = res.replace(/\s{2,}/g, ' ');

  // </p>.
  // res = res.replace(/<\/p>\./g, '</p>');

  // remove spaces before and after dot
  res = res.replace(/(\.\s*)+/g, '.');

  // no space before dot and 1 space after
  res = res.replace(/\s+\.\s*/g, '. ');

  // commas
  res = res.replace(/\s*,\s*/g, ', ');
  // ! + ? + semicolon ;
  if (lang == 'en_US' || lang == 'de_DE') {
    res = res.replace(/\s*!\s*/g, '! ');
    res = res.replace(/\s*\?\s*/g, '? ');
    res = res.replace(/\s*;\s*/g, '; ');
  } else if (lang == 'fr_FR') {
    res = res.replace(/\s*!\s*/g, ' ! ');
    res = res.replace(/\s*\?\s*/g, ' ? ');
    res = res.replace(/\s*;\s*/g, ' ; ');
  }

  // comma and dot just after
  res = res.replace(/\s*,\s*\./g, '. ');

  // ['bla  .   </p>', 'bla.</p>']
  res = res.replace(/\s*\.\s*</g, '.<');

  // ['bla   </p>', 'bla</p>'],
  res = res.replace(/\s+<\/p>/g, '</p>');

  // ['xxx. </p>', 'xxx.</p>'],
  res = res.replace(/\.\s+<\/p>/g, '.</p>');

  // spaces at the very end
  res = res.trim();

  // eat spaces
  res = res.replace(/\s+EATSPACE\s+/g, '');

  // ...

  // ['bla …', 'bla…'],
  res = res.replace(/\s+…/g, '…');

  // ['bla ...bla', 'bla… bla'],
  let regexSpaceAfterEllipsis: RegExp = new RegExp('…s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexSpaceAfterEllipsis, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return '… ' + first;
  });

  // ['<li> xxx', '<li>xxx'],
  // ['xxx </li>', 'xxx<li>'],
  res = res.replace(/>\s+/g, '>');
  res = res.replace(/\s+</g, '<');

  if (lang == 'en_US') {
    // ['the phone \'s', 'The phone\'s'],
    res = res.replace(/\s*'/g, "'");
  }

  return res;
}

function cleanStruct(input: string /*, lang: string*/): string {
  let res: string = input;

  res = res.replace('<p>.</p>', '');
  res = res.replace('</p>.</p>', '</p></p>');
  res = res.replace(/<\/p>\s*.\s*<\/p>/, '</p></p>');

  return res;
}

function enPossessivesBeforeProtect(input: string, lang: string): string {
  let res: string = input;
  // debug("xx: "+ input);

  if (lang == 'en_US') {
    let regexSS: RegExp = new RegExp("(s\\s*§\\s*'s)([^" + tousCaracteresMinMajRe + '])', 'g');
    res = res.replace(regexSS, function(corresp, first, second): string {
      // debug(`AAAA ${corresp} ${first} ${offset} ${orig}`);
      return `s§' ${second}`;
    });
    // debug("yy: "+ res);
  }
  return res;
}

function enPossessives(input: string, lang: string): string {
  let res: string = input;
  // debug("xx: "+ input);

  if (lang == 'en_US') {
    let regexSS: RegExp = new RegExp("(s's)([^" + tousCaracteresMinMajRe + '])', 'g');
    res = res.replace(regexSS, function(corresp, first, second): string {
      // debug(`${corresp} ${first} ${offset} ${orig}`);
      return `s'${second}`;
    });
  }
  return res;
}

// quite the same as aAn but works when the string is protected
function aAnBeforeProtect(input: string, lang: string): string {
  let res: string = input;
  // debug("xx: "+ input);

  if (lang == 'en_US') {
    let regexA: RegExp = new RegExp(
      '[^' + tousCaracteresMinMajRe + '](([aA])\\s*§([' + tousCaracteresMinMajRe + ']*))',
      'g',
    );
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
  }
  return res;
}

function aAn(input: string, lang: string): string {
  let res: string = input;
  // debug("xx: "+ input);

  if (lang == 'en_US') {
    let regexA: RegExp = new RegExp(
      '[^' + tousCaracteresMinMajRe + '](([aA])\\s+([' + tousCaracteresMinMajRe + ']*))',
      'g',
    );
    res = res.replace(regexA, function(corresp, first, second, third): string {
      // debug(`AFTER PROTECT corresp:<${corresp}> first:<${first}> second:<${second}> third:<${third}>`);

      // if it worked we use it, otherwise we do nothing
      // we catch third because compromise lib can change the text : AI->ai but we want to keep AI
      let compResult: string = getCompromiseValidArticle(first);

      if (compResult) {
        let replacement: string = `${compResult} ${third}`;
        // we keep the first char which was just before the 'a'
        // and we keep the caps (a or A)
        return corresp.substring(0, 1) + second + replacement.substring(1);
      } else {
        return corresp;
      }
    });
  }
  return res;
}

function addCaps(input: string /*, lang: string*/): string {
  let res: string = input;

  let regexCapsAfterDot: RegExp = new RegExp('\\.\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterDot, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return '. ' + first.toUpperCase();
  });

  let regexCapsAfterExMark: RegExp = new RegExp('!\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterExMark, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return '! ' + first.toUpperCase();
  });

  let regexCapsAfterQuestionMark: RegExp = new RegExp('\\?\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterQuestionMark, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return '? ' + first.toUpperCase();
  });

  let regexCapsAfterP: RegExp = new RegExp('(<p>)\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterP, function(corresp, first, second): string {
    // debug("BBB :" + corresp);
    return first + second.toUpperCase();
  });

  // caps at the very beginning
  let regexCapsAtVeryBeginning: RegExp = new RegExp('^([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAtVeryBeginning, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return first.toUpperCase();
  });

  return res;
}

function parenthesis(input: string /*, lang: string*/): string {
  let res: string = input;

  // remove spaces after '(' or before ')'
  res = res.replace(/\(\s+/g, '(');
  res = res.replace(/\s+\)/g, ')');

  // add spaces before '(' or after ')'
  let regexSpaceBeforePar: RegExp = new RegExp('[' + tousCaracteresMinMajRe + ']\\(', 'g');
  res = res.replace(regexSpaceBeforePar, function(corresp): string {
    // debug("BBB :<" + corresp + ">");
    return corresp.charAt(0) + ' (';
  });
  let regexSpaceAfterPar: RegExp = new RegExp('\\)[' + tousCaracteresMinMajRe + ']', 'g');
  res = res.replace(regexSpaceAfterPar, function(corresp): string {
    // debug("BBB :<" + corresp + "><" + first + '>');
    return ') ' + corresp.charAt(1);
  });

  return res;
}

function contractions(input: string, lang: string): string {
  if (lang == 'en_US') {
    return input;
  } else if (lang == 'de_DE') {
    return input;
  } else if (lang == 'fr_FR') {
    let res: string = input;

    // de + voyelle, que + voyelle, etc.
    const contrList: string[] = ['[Dd]e', '[Qq]ue', '[Ll]e', '[Ll]a', '[Ss]e'];
    for (let i = 0; i < contrList.length; i++) {
      // gérer le cas où 'de' est en début de phrase
      let regexDe: RegExp = new RegExp(
        '(\\s+|p>)(' + contrList[i] + ')\\s+([' + toutesVoyellesMinMaj + 'h' + '][' + tousCaracteresMinMajRe + ']*)',
        'g',
      );

      res = res.replace(regexDe, function(corresp, before, determiner, word): string {
        if (!isHAspire(word)) {
          return `${before}${determiner.substring(0, determiner.length - 1)}'${word}`;
        } else {
          // do nothing
          return `${before}${determiner} ${word}`;
        }
      });
    }

    // ce arbre => cet arbre
    {
      let regexCe: RegExp = new RegExp(
        '(\\s+|p>)([Cc]e)\\s+([' + toutesVoyellesMinMaj + 'h' + '][' + tousCaracteresMinMajRe + ']*)',
        'g',
      );
      res = res.replace(regexCe, function(corresp, before, determiner, word): string {
        // debug(`${before} ${determiner} ${word}`);
        if (!isHAspire(word)) {
          return `${before}${determiner}t ${word}`;
        } else {
          // do nothing
          return `${before}${determiner} ${word}`;
        }
      });
    }

    // de le => du
    res = res.replace(/\s+de\s+le\s+/g, ' du ');

    // De le => du
    res = res.replace(/De\s+le\s+/g, 'Du ');

    // de les => des
    res = res.replace(/\s+de\s+les\s+/g, ' des ');

    // De les => Des
    res = res.replace(/De\s+les\s+/g, 'Des ');

    // des les => des
    res = res.replace(/\s+des\s+les\s+/g, ' des ');

    // à le => au
    res = res.replace(/\s+à\s+le\s+/g, ' au ');

    // à les => aux
    res = res.replace(/\s+à\s+les\s+/g, ' aux ');

    if (input != res) {
      // debug("changed:" + input + '=>' + res);
    }
    return res;
  } else {
    /* istanbul ignore next */
    return input;
  }
}

export function filter(input: string, language: string): string {
  // debug('FILTER CALL');

  // debug('FILTERING ' + input);
  const supportedLanguages: string[] = ['fr_FR', 'en_US', 'de_DE'];
  if (supportedLanguages.indexOf(language) == -1) {
    var err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${language} is not a supported language. Available ones are ${supportedLanguages.join()}`;
    throw err;
  }

  const filterFctsWhenProtected: Function[] = [
    joinLines,
    cleanSpacesPunctuation,
    cleanStruct,
    parenthesis,
    addCaps,
    contractions,
    egg,
    titlecase,
  ];

  let res: string = applyFilters(input, [aAnBeforeProtect, enPossessivesBeforeProtect], language);

  // pk ProtectMapping ne marche pas ici ???
  let protectedString: string = protectHtmlEscapeSeq(res);

  let protectedMappings: ProtectMapping = protectBlocks(protectedString);

  res = 'START. ' + protectedMappings.protectedString; // to avoid the problem of the ^ in regexp
  res = applyFilters(res, filterFctsWhenProtected, language);
  res = applyFilters(res, [aAn, enPossessives], language);
  res = unprotect(res, protectedMappings.mappings);
  res = unProtectHtmlEscapeSeq(res);
  res = res.replace(/^START\.\s*/, '');

  return res;
}
