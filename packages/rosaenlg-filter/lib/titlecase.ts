/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageFilter } from './LanguageFilter';

export function titlecase(input: string, languageFilter: LanguageFilter): string {
  let res: string = input;

  const titlecaseFlag = '_TITLECASE_';
  const regexTitlecase = new RegExp(`${titlecaseFlag}\\s*(.*?)\\s*${titlecaseFlag}`, 'g');

  res = res.replace(regexTitlecase, (_match, first): string => {
    return languageFilter.titlecase(first);
  });

  return res;
}
