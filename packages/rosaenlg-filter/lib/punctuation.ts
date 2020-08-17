import { Constants, Languages } from 'rosaenlg-commons';

export const EATSPACE = 'EATSPACE';

// warning: we use both allPunctList and stdPunctList to manage Spanish properly
export function duplicatePunctuation(input: string, _lang: Languages, constants: Constants): string {
  let res = input;

  // ['bla ...', 'bla…'],
  res = res.replace(/\.\.\./g, '…');

  // ['bla ! . bla', 'Bla! Bla'],
  const regexDoublePunct = new RegExp(
    `([${constants.allPunctList}])((?:${constants.spaceOrNonBlockingClass}*[${constants.stdPunctList}])*)`,
    'g',
  );
  res = res.replace(regexDoublePunct, function (_match: string, firstPunct: string, otherStuff: string): string {
    const regexRemovePunct = new RegExp(`[${constants.stdPunctList}]`, 'g');
    const removedPunct = otherStuff.replace(regexRemovePunct, function (): string {
      return '';
    });
    return `${firstPunct}${removedPunct}`;
  });

  return res;
}

export function cleanSpacesPunctuation(input: string, lang: Languages, constants: Constants): string {
  let res = input;

  // 2 spaces or more
  res = res.replace(/\s{2,}/g, ' ');

  switch (lang) {
    case 'fr_FR': {
      // all but . and ,
      const regexAllButDot = new RegExp(
        `(${constants.spaceOrNonBlockingClass}*)([:!\\?;])(${constants.spaceOrNonBlockingClass}*)`,
        'g',
      );
      res = res.replace(regexAllButDot, function (_match: string, before: string, punc: string, after: string): string {
        // console.log(`${match} <${before}> <${after}>`);
        return `${before.replace(/\s/g, '')}\xa0${punc} ${after.replace(/\s/g, '')}`;
      });

      // . and , and …
      const regexDot = new RegExp(
        `(${constants.spaceOrNonBlockingClass}*)([\\.,…])(${constants.spaceOrNonBlockingClass}*)`,
        'g',
      );
      res = res.replace(regexDot, function (_match: string, before: string, punc: string, after: string): string {
        // console.log(`${match} <${before}> <${after}>`);
        return `${before.replace(/\s/g, '')}${punc} ${after.replace(/\s/g, '')}`;
      });
      //console.log('xxx ' + res);

      break;
    }
    case 'es_ES': {
      const regexSpanishPunct = new RegExp(`([¡¿])(${constants.spaceOrNonBlockingClass}*)`, 'g');
      res = res.replace(regexSpanishPunct, function (_match, punct, after): string {
        // console.log(`punct: <${punct}> after: <${after}>`);
        return `${punct}${after.replace(/\s/g, '')}`;
      });
      // WE DON'T BREAK, we continue
    }
    case 'en_US':
    case 'it_IT':
    case 'de_DE':
    default: {
      //console.log(res);
      const regexPunct = new RegExp(
        // stdPunctList and not allPunctList: on purpose, as special Spanish is managed just before
        `(${constants.spaceOrNonBlockingClass}*)([${constants.stdPunctList}])(${constants.spaceOrNonBlockingClass}*)`,
        'g',
      );
      res = res.replace(regexPunct, function (_match, before, punct, after): string {
        return `${before.replace(/\s/g, '')}${punct} ${after.replace(/\s/g, '')}`;
      });
      break;
    }
  }

  res = res.replace(/\s+☚/g, '☚');

  // ['bla  .   </p>', 'bla.</p>']
  res = res.replace(/☛\s+/g, '☛');
  res = res.replace(/\s+☚/g, '☚');

  // spaces at the very end
  res = res.trim();

  // eat spaces
  const eatspaceRe = new RegExp(`[\\s¤]+${EATSPACE}[\\s¤]+`, 'g');
  res = res.replace(eatspaceRe, '');

  if (lang === 'en_US') {
    // ['the phone \'s', 'The phone\'s'],
    res = res.replace(/\s*'/g, "'");
  }

  return res;
}

export function parenthesis(input: string, _lang: string, constants: Constants): string {
  let res: string = input;

  // remove spaces after '(' or before ')'
  res = res.replace(/\(\s+/g, '(');
  res = res.replace(/\s+\)/g, ')');

  // add spaces before '(' or after ')'
  const regexSpaceBeforePar = new RegExp('[' + constants.tousCaracteresMinMajRe + ']\\(', 'g');
  res = res.replace(regexSpaceBeforePar, function (corresp): string {
    // console.log("BBB :<" + corresp + ">");
    return corresp.charAt(0) + ' (';
  });
  const regexSpaceAfterPar = new RegExp('\\)[' + constants.tousCaracteresMinMajRe + ']', 'g');
  res = res.replace(regexSpaceAfterPar, function (corresp): string {
    // console.log("BBB :<" + corresp + "><" + first + '>');
    return ') ' + corresp.charAt(1);
  });

  return res;
}

export function quotes(input: string /*, lang: string*/): string {
  let res: string = input;

  let alreadyStarted = false;
  res = res.replace(new RegExp(`(\\s*)"(\\s*)`, 'g'), function (/*corresp, before, after*/): string {
    if (!alreadyStarted) {
      alreadyStarted = true;
      return ' "';
    } else {
      alreadyStarted = false;
      return '" ';
    }
  });
  // trigger a warning if an end is missing
  if (alreadyStarted) {
    console.log(`WARNING: did find a starting " but not the ending one`);
  }

  // mixes of quotes and parenthesis
  res = res.replace(new RegExp(`\\(\\s*"`, 'g'), function (): string {
    // console.log(`before: <${before}> after: <${after}> corresp: <${_corresp}>`);
    return ' ("';
  });
  res = res.replace(new RegExp(`"\\s*\\)`, 'g'), function (): string {
    // console.log(`before: <${before}> after: <${after}> corresp: <${_corresp}>`);
    return '") ';
  });

  return res;
}

export function addCaps(input: string, lang: string, constants: Constants): string {
  let res: string = input;

  {
    const triggerCapsWithSpace = '[\\.!\\?¡¿]';
    const regexCapsAfterDot = new RegExp(
      `(${triggerCapsWithSpace})(${constants.spaceOrNonBlockingClass}*)([${constants.tousCaracteresMinMajRe}])`,
      'g',
    );
    res = res.replace(regexCapsAfterDot, function (_corresp, punct, before, firstWord): string {
      return `${punct}${before.replace(/\s/g, '')} ${firstWord.toUpperCase()}`;
    });
  }

  if (lang == 'es_ES') {
    const triggerCapsNoSpace = '[¡¿]';
    {
      const regexCapsAfterDot = new RegExp(
        `(${triggerCapsNoSpace})(${constants.spaceOrNonBlockingClass}*)([${constants.tousCaracteresMinMajRe}])`,
        'g',
      );
      res = res.replace(regexCapsAfterDot, function (_corresp, punct, before, firstWord): string {
        // same as above but without added space
        return `${punct}${before.replace(/\s/g, '')}${firstWord.toUpperCase()}`;
      });
    }
  }

  {
    const regexCapsAfterP = new RegExp(
      `([☛☚])(${constants.spaceOrNonBlockingClass}*)([${constants.tousCaracteresMinMajRe}])`,
      'g',
    );
    res = res.replace(regexCapsAfterP, function (match, start, between, char): string {
      return `${start}${between.replace(/ /g, '')}${char.toUpperCase()}`;
    });
  }

  return res;
}
