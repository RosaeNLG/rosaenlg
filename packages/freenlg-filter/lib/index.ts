import { contractions as contractionsItIT } from './italian';
import { contractions as contractionsFrFR } from './french';
import * as punctuation from './punctuation';
import * as clean from './clean';
import * as english from './english';
import { Languages } from './constants';
import { titlecase } from './titlecase';
import * as protect from './protect';

//import * as Debug from 'debug';
//const debug = Debug('freenlg-filter');

function applyFilters(input: string, toApply: Function[], language: Languages): string {
  let res: string = input;
  for (let i = 0; i < toApply.length; i++) {
    res = toApply[i](res, language);
    // debug(`after: ${res}`);
  }
  return res;
}

function egg(input: string /*, lang: string*/): string {
  let res: string = input;

  let x = '\x41\x64\x64\x76\x65\x6E\x74\x61';
  let regex = new RegExp(x, 'g');
  res = res.replace(regex, x + ' 👍');

  return res;
}

function contractions(input: string, lang: Languages): string {
  switch (lang) {
    case 'en_US':
      return input;
    case 'de_DE':
      return input;
    case 'it_IT':
      return contractionsItIT(input);
    case 'fr_FR':
      return contractionsFrFR(input);
  }
}

export function filter(input: string, language: Languages): string {
  // debug('FILTER CALL');

  // debug('FILTERING ' + input);
  const supportedLanguages: string[] = ['fr_FR', 'en_US', 'de_DE', 'it_IT'];
  if (supportedLanguages.indexOf(language) == -1) {
    let err = new Error();
    err.name = 'InvalidArgumentError';
    err.message = `${language} is not a supported language. Available ones are ${supportedLanguages.join()}`;
    throw err;
  }

  const filterFctsWhenProtected: Function[] = [
    clean.joinLines,
    punctuation.cleanSpacesPunctuation,
    clean.cleanStruct,
    punctuation.parenthesis,
    punctuation.addCaps, // must be before contractions otherwise difficult to find words
    contractions,
    egg,
    titlecase,
  ];

  let res: string = input;
  if (language == 'en_US') {
    res = applyFilters(input, [english.aAnBeforeProtect, english.enPossessivesBeforeProtect], 'en_US');
  }

  // pk ProtectMapping ne marche pas ici ???
  let protectedString: string = protect.protectHtmlEscapeSeq(res);

  let protectedMappings: protect.ProtectMapping = protect.protectBlocks(protectedString);

  res = 'START. ' + protectedMappings.protectedString; // to avoid the problem of the ^ in regexp
  res = applyFilters(res, filterFctsWhenProtected, language);

  if (language == 'en_US') {
    res = applyFilters(res, [english.aAn, english.enPossessives], 'en_US');
  }

  res = protect.unprotect(res, protectedMappings.mappings);
  res = protect.unProtectHtmlEscapeSeq(res);
  res = res.replace(/^START\.\s*/, '');

  return res;
}
