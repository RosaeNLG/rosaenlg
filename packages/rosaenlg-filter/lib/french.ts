import { isHAspire } from 'french-h-muet-aspire';
import { contract2elts } from './contractionsHelper';
import { Constants, Languages } from './constants';

export function contractions(input: string, _lang: Languages, constants: Constants): string {
  let res = input;

  // de + voyelle, que + voyelle, etc.
  {
    const contrList: string[] = [
      '[Dd]e',
      '[Qq]ue',
      '[Ll]e',
      '[Ll]a',
      '[Ss]e',
      '[Jj]e',
      '[Tt]e',
      '[Mm]e',
      '[Nn]e',
      '[Pp]uisque',
      '[Jj]usque',
      '[Ll]orsque',
    ];
    for (let i = 0; i < contrList.length; i++) {
      // gérer le cas où 'de' est en début de phrase
      const regexDe = new RegExp(
        `${constants.stdBeforeWithParenthesis}(${contrList[i]})${constants.stdBetweenWithParenthesis}([${constants.toutesVoyellesMinMaj}h][${constants.tousCaracteresMinMajRe}]*)`,
        'g',
      );
      res = res.replace(regexDe, function (corresp, before, determiner, between, word): string {
        const newBetween = between.replace(/ /g, ''); // we contract thus keep no space
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
    const regexCe = new RegExp(
      `${constants.stdBeforeWithParenthesis}([Cc]e)${constants.stdBetweenWithParenthesis}([${constants.toutesVoyellesMinMaj}h][${constants.tousCaracteresMinMajRe}]*)`,
      'g',
    );
    res = res.replace(regexCe, function (corresp, before, determiner, between, word): string {
      // debug(`${before} ${determiner} ${word}`);
      const newBetween = between;
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
      ['de', 'lequel', 'duquel'],
      ['de', 'lesquels', 'desquels'],
      ['de', 'lesquelles', 'desquelles'],
      ['des', 'les', 'des'],
      ['à', 'le', 'au'],
      ['à', 'lequel', 'auquel'],
      ['à', 'les', 'aux'],
      ['à', 'lesquels', 'auxquels'],
      ['à', 'lesquelles', 'auxquelles'],
    ];

    for (let i = 0; i < contrList.length; i++) {
      res = contract2elts(contrList[i][0], contrList[i][1], contrList[i][2], constants, res);
    }
  }

  return res;
}
