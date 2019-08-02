import { isHAspire } from '@rosaenlg/french-h-muet-aspire';
import { toutesVoyellesMinMaj, tousCaracteresMinMajRe, spaceOrNonBlockingClass, stdBeforeWithParenthesis, stdBetweenWithParenthesis} from './constants';

export function contractions(input: string): string {
  let res = input;


  // de + voyelle, que + voyelle, etc.
  {
    const contrList: string[] = ['[Dd]e', '[Qq]ue', '[Ll]e', '[Ll]a', '[Ss]e', '[Jj]e'];
    for (let i = 0; i < contrList.length; i++) {
      // gérer le cas où 'de' est en début de phrase
      let regexDe = new RegExp(
        `${stdBeforeWithParenthesis}(${contrList[i]})${stdBetweenWithParenthesis}([${toutesVoyellesMinMaj}h][${tousCaracteresMinMajRe}]*)`,
        'g',
      );
      res = res.replace(regexDe, function(corresp, before, determiner, between, word): string {
        let newBetween = between.replace(/ /g, ''); // we contract thus keep no space
        if (!isHAspire(word)) {
          return `${before}${determiner.substring(0, determiner.length - 1)}'${newBetween}${word}`;
        } else {
          // do nothing
          return `${before}${newBetween}${determiner} ${word}`;
        }
      });
    }
  }

  // ce arbre => cet arbre
  {
    let regexCe = new RegExp(
      `${stdBeforeWithParenthesis}([Cc]e)${stdBetweenWithParenthesis}([${toutesVoyellesMinMaj}h][${tousCaracteresMinMajRe}]*)`,
      'g',
    );
    res = res.replace(regexCe, function(corresp, before, determiner, between, word): string {
      // debug(`${before} ${determiner} ${word}`);
      let newBetween = between;
      if (!isHAspire(word)) {
        return `${before}${determiner}t${newBetween}${word}`;
      } else {
        // do nothing
        return `${before}${determiner}${newBetween}${word}`;
      }
    });
  }

  {
    const contrList = [
      ['de', 'le', 'du'],
      ['de', 'les', 'des'],
      ['des', 'les', 'des'],
      ['à', 'le', 'au'],
      ['à', 'les', 'aux'],
    ];

    for (let i=0; i<contrList.length; i++) {
      const rawFirstPart = contrList[i][0];

      // de => [d|D]e
      const firstPart = `[${rawFirstPart.substring(0,1)}|${rawFirstPart.substring(0,1).toUpperCase()}]${rawFirstPart.substring(1)}`;
      // console.log(firstPart);
      const secondPart = contrList[i][1];
      const replacer = contrList[i][2];

      let regexContr = new RegExp(`${stdBeforeWithParenthesis}(${firstPart})${stdBetweenWithParenthesis}${secondPart}${stdBetweenWithParenthesis}`, 'g');
      res = res.replace(regexContr, function(match:string, before:string, part1: string, between:string, after: string): string {
        const isUc = part1.substring(0, 1).toLowerCase() != part1.substring(0, 1);
        const newDet = isUc ? replacer.substring(0,1).toUpperCase() + replacer.substring(1) : replacer;
        //return `${before}des ${(between + after).replace(/ /g, '')}`;
        return `${before}${newDet}${between}${after}`;
      });
    }

  }

  return res;
}
