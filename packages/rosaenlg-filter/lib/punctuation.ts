import { tousCaracteresMinMajRe } from './constants';
import { Languages } from './constants';

export function cleanSpacesPunctuation(input: string, lang: Languages): string {
  let res = input;

  // ['bla ...', 'bla…'],
  res = res.replace(/\.\.\./g, '…');

  // ['bla ! . bla', 'Bla! Bla'],
  res = res.replace(/\s*!\s*\.\s*/g, '!');

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
  // ! + ? + semicolon ; + :
  switch (lang) {
    case 'fr_FR':
      res = res.replace(/\s*:\s*/g, '\xa0: ');
      res = res.replace(/\s*!\s*/g, '\xa0! ');
      res = res.replace(/\s*\?\s*/g, '\xa0? ');
      res = res.replace(/\s*;\s*/g, '\xa0; ');
      break;
    case 'en_US':
    case 'it_IT':
    case 'de_DE':
    default:
      res = res.replace(/\s*:\s*/g, ': ');
      res = res.replace(/\s*!\s*/g, '! ');
      res = res.replace(/\s*\?\s*/g, '? ');
      res = res.replace(/\s*;\s*/g, '; ');
      break;
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
  let regexSpaceAfterEllipsis = new RegExp('…s*([' + tousCaracteresMinMajRe + '])', 'g');
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

export function parenthesis(input: string /*, lang: string*/): string {
  let res: string = input;

  // remove spaces after '(' or before ')'
  res = res.replace(/\(\s+/g, '(');
  res = res.replace(/\s+\)/g, ')');

  // add spaces before '(' or after ')'
  let regexSpaceBeforePar = new RegExp('[' + tousCaracteresMinMajRe + ']\\(', 'g');
  res = res.replace(regexSpaceBeforePar, function(corresp): string {
    // debug("BBB :<" + corresp + ">");
    return corresp.charAt(0) + ' (';
  });
  let regexSpaceAfterPar = new RegExp('\\)[' + tousCaracteresMinMajRe + ']', 'g');
  res = res.replace(regexSpaceAfterPar, function(corresp): string {
    // debug("BBB :<" + corresp + "><" + first + '>');
    return ') ' + corresp.charAt(1);
  });

  return res;
}

export function addCaps(input: string /*, lang: string*/): string {
  let res: string = input;

  let regexCapsAfterDot = new RegExp('\\.\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterDot, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return '. ' + first.toUpperCase();
  });

  let regexCapsAfterExMark = new RegExp('!\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterExMark, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return '! ' + first.toUpperCase();
  });

  let regexCapsAfterQuestionMark = new RegExp('\\?\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterQuestionMark, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return '? ' + first.toUpperCase();
  });

  let regexCapsAfterP = new RegExp('(<p>)\\s*([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAfterP, function(corresp, first, second): string {
    // debug("BBB :" + corresp);
    return first + second.toUpperCase();
  });

  // caps at the very beginning
  let regexCapsAtVeryBeginning = new RegExp('^([' + tousCaracteresMinMajRe + '])', 'g');
  res = res.replace(regexCapsAtVeryBeginning, function(corresp, first): string {
    // debug("AAA :" + corresp);
    return first.toUpperCase();
  });

  return res;
}
