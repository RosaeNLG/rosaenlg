import { tousCaracteresMinMajRe } from './constants';
import { Languages, allPunctList, spaceOrNonBlockingClass } from './constants';

export function duplicatePunctuation(input: string, lang: Languages): string {
  let res = input;

  // ['bla ...', 'bla…'],
  res = res.replace(/\.\.\./g, '…');

  // ['bla ! . bla', 'Bla! Bla'],
  let regexDoublePunct = new RegExp(`([${allPunctList}])((?:${spaceOrNonBlockingClass}*[${allPunctList}])*)`, 'g');
  res = res.replace(regexDoublePunct, function(match: string, firstPunct: string, otherStuff: string): string {
    let regexRemovePunct = new RegExp(`[${allPunctList}]`, 'g');    
    let removedPunct = otherStuff.replace(regexRemovePunct, function(match:string): string {
      return '';
    });
    return `${firstPunct}${removedPunct}`;
  });

  return res;

}

export function cleanSpacesPunctuation(input: string, lang: Languages): string {
  let res = input;

  // 2 spaces or more
  res = res.replace(/\s{2,}/g, ' ');

  switch (lang) {
    case 'fr_FR':

      // all but . and ,
      let regexAllButDot = new RegExp(`(${spaceOrNonBlockingClass}*)([:!\\?;])(${spaceOrNonBlockingClass}*)`, 'g');
      res = res.replace(regexAllButDot, function(match: string, before: string, punc:string, after: string): string {
        // console.log(`${match} <${before}> <${after}>`);
        return `${before.replace(/\s/g, '')}\xa0${punc} ${after.replace(/\s/g, '')}`
      });

      // . and , and …
      let regexDot = new RegExp(`(${spaceOrNonBlockingClass}*)([\\.,…])(${spaceOrNonBlockingClass}*)`, 'g');
      res = res.replace(regexDot, function(match: string, before: string, punc:string, after: string): string {
        // console.log(`${match} <${before}> <${after}>`);
        return `${before.replace(/\s/g, '')}${punc} ${after.replace(/\s/g, '')}`
      });
      //console.log('xxx ' + res);
      
      break;
    case 'en_US':
    case 'it_IT':
    case 'de_DE':
    default:
      //console.log(res);
      let regexPunct = new RegExp(`(${spaceOrNonBlockingClass}*)([${allPunctList}])(${spaceOrNonBlockingClass}*)`, 'g');
      res = res.replace(regexPunct, function(match, before, punct, after): string {
        return `${before.replace(/\s/g, '')}${punct}${after.replace(/\s/g, '')} `;
      });      
      break;
  }


  res = res.replace(/\s+☚/g, '☚');


  // ['bla  .   </p>', 'bla.</p>']
  res = res.replace(/☛\s+/g, '☛');
  res = res.replace(/\s+☚/g, '☚');

  // spaces at the very end
  res = res.trim();

  // eat spaces
  res = res.replace(/\s+EATSPACE\s+/g, '');

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

  const triggerCaps = '[\\.!\\?]';
  {
    let regexCapsAfterDot = new RegExp(`(${triggerCaps})(${spaceOrNonBlockingClass}*)([${tousCaracteresMinMajRe}])`, 'g');
    res = res.replace(regexCapsAfterDot, function(corresp, punct, before, firstWord): string {
      return `${punct}${before.replace(/\s/g, '')} ${firstWord.toUpperCase()}`;
    });
  }

  {
    let regexCapsAfterP = new RegExp(`([☛☚])(${spaceOrNonBlockingClass}*)([${tousCaracteresMinMajRe}])`, 'g');
    res = res.replace(regexCapsAfterP, function(match, start, between, char): string {
      return `${start}${between.replace(/ /g, '')}${char.toUpperCase()}`;
    });
  }

  return res;
}
