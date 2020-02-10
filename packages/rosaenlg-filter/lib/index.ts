import { contractions as contractionsItIT } from './italian';
import { contractions as contractionsFrFR } from './french';
import * as punctuation from './punctuation';
import * as clean from './clean';
import * as english from './english';
import { Languages } from './constants';
import { titlecase } from './titlecase';
import * as protect from './protect';
import * as html from './html';

export const blockLevelHtmlElts = html.blockLevelElts;
export const inlineHtmlElts = html.inlineElts;
export const EATSPACE = punctuation.EATSPACE;

//import * as Debug from 'debug';
//const debug = Debug('rosaenlg-filter');

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

  const x = '\x41\x64\x64\x76\x65\x6E\x74\x61';
  const regex = new RegExp(x, 'g');
  res = res.replace(regex, x + ' 👍');

  return res;
}

function contractions(input: string, lang: Languages): string {
  switch (lang) {
    case 'it_IT':
      return contractionsItIT(input);
    case 'fr_FR':
      return contractionsFrFR(input);
    case 'en_US':
    case 'de_DE':
    default:
      return input;
  }
}

export function filter(input: string, language: Languages): string {
  // debug('FILTER CALL');

  // debug('FILTERING ' + input);

  let res: string = input;

  // PROTECT HTML SEQ
  res = html.protectHtmlEscapeSeq(res);

  // PROTECT HTML TAGS
  const replacedHtml = html.replaceHtml(res);
  res = replacedHtml.replaced;

  // ADD START to avoid the problem of the ^ in regexp
  res = 'START. ' + res;

  if (language === 'en_US') {
    res = applyFilters(res, [english.aAnBeforeProtect, english.enPossessivesBeforeProtect], 'en_US');
  }

  // PROTECT § BLOCKS
  const protectedMappings: protect.ProtectMapping = protect.protectBlocks(res);
  res = protectedMappings.protectedString;

  res = applyFilters(
    res,
    [
      clean.joinLines,
      clean.specialSpacesToNormalSpaces, // do it early so that all the rest does not have to care for ¤
      punctuation.duplicatePunctuation,
      contractions,
      clean.cleanStruct,
      punctuation.parenthesis,
      punctuation.quotes, // must be before cleanSpacesPunctuation as it can introduce double spaces
      punctuation.cleanSpacesPunctuation,
      punctuation.addCaps, // must be before contractions otherwise difficult to find words
      egg,
      titlecase,
    ],
    language,
  );

  if (language === 'en_US') {
    res = applyFilters(res, [english.aAn, english.enPossessives], 'en_US');
  }

  // UNPROTECT § BLOCKS
  res = protect.unprotect(res, protectedMappings.mappings);

  // REMOVE START - has to be before UNPROTECT HTML TAGS
  const regexRemoveStart = new RegExp('^START([☞\\s\\.]+)', 'g');
  res = res.replace(regexRemoveStart, function(match: string, before: string): string {
    return `${before.replace(/[\s\.]*/g, '')}`;
  });

  // UNPROTECT HTML TAGS
  res = html.replacePlaceholders(res, replacedHtml.elts);
  res = applyFilters(res, [clean.cleanStructAfterUnprotect], language);

  // UNPROTECT HTML SEQ
  res = html.unProtectHtmlEscapeSeq(res);

  // REMOVE spaces at the beginning and at the end
  res = res.trim();

  return res;
}
