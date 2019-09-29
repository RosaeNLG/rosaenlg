export function joinLines(input: string /*, lang: string*/): string {
  return input.replace(/\n|\r/g, ' ');
}

import { allPunctList } from './constants';

export function cleanStruct(input: string /*, lang: string*/): string {
  let res: string = input;

  const regexBetweenNewPara = new RegExp(`☚([${allPunctList}\\s]+)☛`, 'g');
  res = res.replace(regexBetweenNewPara, function(match: string, between: string): string {
    // console.log('<' + between + '> is removed');
    return '☚☛';
  });

  const regexOrphanDot = new RegExp(`☚([${allPunctList}\\s]+)☚`, 'g');
  res = res.replace(regexOrphanDot, function(match: string, between: string): string {
    // console.log('<' + between + '> is removed');
    return '☚☚';
  });

  const regexSpacesBeginning = new RegExp(`(\\s*)(☞[☞\\s]*)\\s+`, 'g');
  res = res.replace(regexSpacesBeginning, function(match: string, before: string, between: string): string {
    return `${before}${between.replace(/\s/g, '')}`;
  });
  const regexSpacesEnd = new RegExp(`\\s+(☜[☜\\s]*)(\\s*)`, 'g');
  res = res.replace(regexSpacesEnd, function(match: string, between: string, after: string): string {
    return `${between.replace(/\s/g, '')}${after}`;
  });

  return res;
}

export function cleanStructAfterUnprotect(input: string /*, lang: string*/): string {
  let res: string = input;

  res = res.replace('<p>.</p>', '');

  return res;
}
