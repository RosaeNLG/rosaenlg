/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export function joinLines(input: string): string {
  return input.replace(/\n|\r/g, ' ');
}

import { Constants } from 'rosaenlg-commons';

export function cleanStruct(input: string, constants: Constants): string {
  let res: string = input;

  const regexBetweenNewPara = new RegExp(`☚([${constants.allPunctList}\\s]+)☛`, 'g');
  res = res.replace(regexBetweenNewPara, (): string => {
    return '☚☛';
  });

  const regexOrphanDot = new RegExp(`☚([${constants.allPunctList}\\s]+)☚`, 'g');
  res = res.replace(regexOrphanDot, (): string => {
    return '☚☚';
  });

  const regexSpacesBeginning = new RegExp(`(\\s*)(☞[☞\\s]*)\\s+`, 'g');
  res = res.replace(regexSpacesBeginning, (_match: string, before: string, between: string): string => {
    return `${before}${between.replace(/\s/g, '')}`;
  });
  const regexSpacesEnd = new RegExp(`\\s+([☜\\s]*☜)(\\s*)`, 'g');
  res = res.replace(regexSpacesEnd, (_match: string, between: string, after: string): string => {
    return `${between.replace(/\s/g, '')}${after}`;
  });

  return res;
}

export function cleanStructAfterUnprotect(input: string): string {
  let res: string = input;

  const emptyParas = new RegExp(`<p>\\.</p>`, 'g');
  res = res.replace(emptyParas, '');

  return res;
}

export function specialSpacesToNormalSpaces(input: string): string {
  return input.replace(/¤/g, ' ');
}
