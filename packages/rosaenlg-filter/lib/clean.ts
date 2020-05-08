export function joinLines(input: string /*, lang: string*/): string {
  return input.replace(/\n|\r/g, ' ');
}

import { Constants } from './constants';

export function cleanStruct(input: string, _lang: string, constants: Constants): string {
  let res: string = input;

  const regexBetweenNewPara = new RegExp(`☚([${constants.allPunctList}\\s]+)☛`, 'g');
  res = res.replace(regexBetweenNewPara, function (): string {
    // console.log('<' + between + '> is removed');
    return '☚☛';
  });

  const regexOrphanDot = new RegExp(`☚([${constants.allPunctList}\\s]+)☚`, 'g');
  res = res.replace(regexOrphanDot, function (): string {
    // console.log('<' + between + '> is removed');
    return '☚☚';
  });

  const regexSpacesBeginning = new RegExp(`(\\s*)(☞[☞\\s]*)\\s+`, 'g');
  res = res.replace(regexSpacesBeginning, function (match: string, before: string, between: string): string {
    return `${before}${between.replace(/\s/g, '')}`;
  });
  const regexSpacesEnd = new RegExp(`\\s+(☜[☜\\s]*)(\\s*)`, 'g');
  res = res.replace(regexSpacesEnd, function (match: string, between: string, after: string): string {
    return `${between.replace(/\s/g, '')}${after}`;
  });

  return res;
}

export function cleanStructAfterUnprotect(input: string /*, lang: string*/): string {
  let res: string = input;

  const emptyParas = new RegExp(`<p>\\.</p>`, 'g');
  res = res.replace(emptyParas, '');

  return res;
}

export function specialSpacesToNormalSpaces(input: string): string {
  return input.replace(/¤/g, ' ');
  /*
  let res: string = input;

  const specialSpaces = new RegExp('¤', 'g');
  res = res.replace(specialSpaces, ' ');

  return res;
  */
}
