/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageFilter } from './LanguageFilter';
import { Constants } from 'rosaenlg-commons';

export const EATSPACE = 'EATSPACE';

// warning: we use both allPunctList and stdPunctList to manage Spanish properly
export function duplicatePunctuation(input: string, languageFilter: LanguageFilter): string {
  let res = input;

  // ['bla ...', 'bla…'],
  res = res.replace(/\.\.\./g, '…');

  // ['bla ! . bla', 'Bla! Bla'],
  const regexDoublePunct = new RegExp(
    `([${languageFilter.constants.allPunctList}])((?:${languageFilter.constants.spaceOrNonBlockingClass}*[${Constants.stdPunctList}])*)`,
    'g',
  );
  res = res.replace(regexDoublePunct, function (_match: string, firstPunct: string, otherStuff: string): string {
    const regexRemovePunct = new RegExp(`[${Constants.stdPunctList}]`, 'g');
    const removedPunct = otherStuff.replace(regexRemovePunct, (): string => {
      return '';
    });
    return `${firstPunct}${removedPunct}`;
  });

  return res;
}

export function cleanSpacesPunctuation(input: string, languageFilter: LanguageFilter): string {
  let res = input;

  // 2 spaces or more
  res = res.replace(/\s{2,}/g, ' ');

  res = languageFilter.cleanSpacesPunctuation(res);

  if (languageFilter.cleanSpacesPunctuationDoDefault) {
    const regexPunct = new RegExp(
      // stdPunctList and not allPunctList: on purpose, as special Spanish is managed just before
      `(${languageFilter.constants.spaceOrNonBlockingClass}*)([${Constants.stdPunctList}])(${languageFilter.constants.spaceOrNonBlockingClass}*)`,
      'g',
    );
    res = res.replace(regexPunct, (_match, before, punct, after): string => {
      return `${before.replace(/\s/g, '')}${punct} ${after.replace(/\s/g, '')}`;
    });
  }

  res = res.replace(/\s+☚/g, '☚');

  // ['bla  .   </p>', 'bla.</p>']
  res = res.replace(/☛\s+/g, '☛');
  res = res.replace(/\s+☚/g, '☚');

  // spaces at the very end
  res = res.trim();

  // eat spaces
  const eatspaceRe = new RegExp(`[\\s¤]*${EATSPACE}[\\s¤]*`, 'g');
  res = res.replace(eatspaceRe, '');

  res = languageFilter.cleanSpacesPunctuationCorrect(res);

  return res;
}

export function parenthesis(input: string, languageFilter: LanguageFilter): string {
  let res: string = input;

  // remove spaces after '(' or before ')'
  res = res.replace(/\(\s+/g, '(');
  res = res.replace(/\s+\)/g, ')');

  // add spaces before '(' or after ')'
  const regexSpaceBeforePar = new RegExp('[' + languageFilter.constants.tousCaracteresMinMajRe + ']\\(', 'g');
  res = res.replace(regexSpaceBeforePar, (match): string => {
    return match.charAt(0) + ' (';
  });
  const regexSpaceAfterPar = new RegExp('\\)[' + languageFilter.constants.tousCaracteresMinMajRe + ']', 'g');
  res = res.replace(regexSpaceAfterPar, (match): string => {
    return ') ' + match.charAt(1);
  });

  return res;
}

export function quotes(input: string): string {
  let res: string = input;

  let alreadyStarted = false;
  res = res.replace(/(\s*)"(\s*)/g, (): string => {
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
  res = res.replace(/\(\s*"/g, (): string => {
    return ' ("';
  });
  res = res.replace(/"\s*\)/g, (): string => {
    return '") ';
  });

  return res;
}

export function addCaps(input: string, languageFilter: LanguageFilter): string {
  let res: string = input;

  {
    const triggerCapsWithSpace = '[\\.!\\?¡¿]';
    const regexCapsAfterDot = new RegExp(
      `(${triggerCapsWithSpace})(${languageFilter.constants.spaceOrNonBlockingClass}*)([${languageFilter.constants.tousCaracteresMinMajRe}])`,
      'g',
    );
    res = res.replace(regexCapsAfterDot, (_match, punct, before, firstWord): string => {
      return `${punct}${before.replace(/\s/g, '')} ${firstWord.toUpperCase()}`;
    });
  }

  res = languageFilter.addCapsSpecific(res);

  {
    const regexCapsAfterP = new RegExp(
      `([☛☚])(${languageFilter.constants.spaceOrNonBlockingClass}*)([${languageFilter.constants.tousCaracteresMinMajRe}])`,
      'g',
    );
    res = res.replace(regexCapsAfterP, (_match, start, between, char): string => {
      return `${start}${between.replace(/ /g, '')}${char.toUpperCase()}`;
    });
  }

  return res;
}
