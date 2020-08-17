import titleCaseEnUs from 'better-title-case';
import * as titleCaseFrFr from 'titlecase-french';

import { Languages } from 'rosaenlg-commons';

export function titlecase(input: string, lang: Languages): string {
  let res: string = input;

  const titlecaseFlag = '_TITLECASE_';
  const regexTitlecase = new RegExp(`${titlecaseFlag}\\s*(.*?)\\s*${titlecaseFlag}`, 'g');

  res = res.replace(regexTitlecase, function (corresp, first): string {
    // console.log("TITLECASE :<" + corresp + '><' + first + '>');
    switch (lang) {
      case 'en_US':
        return titleCaseEnUs(first);
      case 'fr_FR':
        return titleCaseFrFr.convert(first);
      case 'it_IT':
      case 'de_DE': {
        // not supported for de_DE
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `titlecase is not available for ${lang}`;
        throw err;
      }
    }
  });

  return res;
}
