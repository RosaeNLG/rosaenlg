/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import * as punctuation from './punctuation';
import * as clean from './clean';
import { LanguageCommon } from 'rosaenlg-commons';
import { titlecase } from './titlecase';
import * as protect from './protect';
import * as html from './html';

import { LanguageFilter } from './LanguageFilter';
import { languageFilterFromLanguageCommon } from './languageFilterHelper';

export interface FilterParams {
  renderDebug?: boolean;
}

export const blockLevelHtmlElts = html.blockLevelElts;
export const inlineHtmlElts = html.inlineElts;
export const EATSPACE = punctuation.EATSPACE;

function egg(input: string): string {
  let res: string = input;

  const x = '\x41\x64\x64\x76\x65\x6E\x74\x61';
  const regex = new RegExp(x, 'g');
  res = res.replace(regex, x + ' 👍');

  return res;
}

export function filter(input: string, languageCommon: LanguageCommon, filterParams: FilterParams): string {
  const languageFilter: LanguageFilter = languageFilterFromLanguageCommon(languageCommon);

  let res: string = input;

  // PROTECT HTML SEQ
  res = html.protectHtmlEscapeSeq(res);

  // PROTECT HTML TAGS
  const replacedHtml = html.replaceHtml(res);
  res = replacedHtml.replaced;

  // ADD START to avoid the problem of the ^ in regexp
  res = 'START. ' + res;

  res = languageFilter.protectRawNumbers(res);
  res = languageFilter.beforeProtect(res);

  // PROTECT § BLOCKS
  const protectedMappings: protect.ProtectMapping = protect.protectBlocks(res);
  res = protectedMappings.protectedString;

  res = clean.joinLines(res);

  // do it early so that all the rest does not have to care for ¤
  res = clean.specialSpacesToNormalSpaces(res);

  res = punctuation.duplicatePunctuation(res, languageFilter);

  res = languageFilter.contractions(res);

  res = clean.cleanStruct(res, languageFilter.constants);

  res = punctuation.parenthesis(res, languageFilter);

  // must be before cleanSpacesPunctuation as it can introduce double spaces
  res = punctuation.quotes(res);

  res = punctuation.cleanSpacesPunctuation(res, languageFilter);

  // must be before contractions otherwise difficult to find words
  res = punctuation.addCaps(res, languageFilter);

  res = egg(res);

  res = titlecase(res, languageFilter);

  // must be done at the very end, as there is a recapitalization process
  res = languageFilter.justBeforeUnprotect(res);

  // UNPROTECT § BLOCKS
  res = protect.unprotect(res, protectedMappings.mappings);

  // REMOVE START - has to be before UNPROTECT HTML TAGS
  const regexRemoveStart = new RegExp('^START([☞\\s\\.]+)', 'g');
  res = res.replace(regexRemoveStart, (_match: string, before: string): string => {
    return `${before.replace(/[\s\.]*/g, '')}`;
  });

  // UNPROTECT HTML TAGS
  res = html.replacePlaceholders(res, replacedHtml.elts);
  if (filterParams.renderDebug) {
    res = html.changeRenderDebug(res);
  }

  res = clean.cleanStructAfterUnprotect(res);

  // UNPROTECT HTML SEQ
  res = html.unProtectHtmlEscapeSeq(res);

  // REMOVE spaces at the beginning and at the end
  res = res.trim();

  return res;
}
