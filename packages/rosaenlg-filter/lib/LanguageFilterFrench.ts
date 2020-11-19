import { LanguageFilter } from './LanguageFilter';
import { contracts } from 'french-contractions';
import * as titleCaseFrFr from 'titlecase-french';

export class LanguageFilterFrench extends LanguageFilter {
  cleanSpacesPunctuationDoDefault = false;

  private getAfterDeterminer(beforeProtect: boolean): string {
    return `${this.constants.stdBetweenWithParenthesis}(${this.constants.getInBetween(beforeProtect)})([${
      this.constants.toutesVoyellesMinMaj
    }hH][${this.constants.tousCaracteresMinMajRe}]*)`;
  }

  // de + voyelle, que + voyelle, etc.
  private twoWordsContractions(input: string): string {
    let res = input;

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
      res = this.contract2elts(contrList[i][0], contrList[i][1], contrList[i][2], res);
    }

    return res;
  }

  private articlesContractionsGeneric(input: string, beforeProtect: boolean): string {
    let res = input;

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
        `${this.constants.stdBeforeWithParenthesis}(${contrList[i]})${this.getAfterDeterminer(beforeProtect)}`,
        'g',
      );
      res = res.replace(regexDe, (_match, before, determiner, between, beforeWord, word): string => {
        const newBetween = (between + beforeWord).replace(/[\s¤]+/g, ''); // we contract thus keep no space
        // console.log(`new between: <${newBetween}>`);
        if (contracts(word, this.dictManager.getAdjsWordsData())) {
          return `${before}${determiner.substring(0, determiner.length - 1)}'${newBetween}${word}`;
        } else {
          // do nothing
          return `${before}${newBetween}${determiner} ${word}`;
        }
      });
    }

    return res;
  }

  // ce arbre => cet arbre
  private ceCetGeneric(input: string, beforeProtect: boolean): string {
    let res = input;

    const regexCe = new RegExp(
      `${this.constants.stdBeforeWithParenthesis}([Cc]e)${this.getAfterDeterminer(beforeProtect)}`,
      'g',
    );
    res = res.replace(regexCe, (_match, before, determiner, between, beforeWord, word): string => {
      // console.log(`${before} ${determiner} ${word}`);
      const newBetween = between + beforeWord;
      if (contracts(word, this.dictManager.getAdjsWordsData())) {
        return `${before}${determiner}t${newBetween}${word}`;
      } else {
        // do nothing
        return `${before}${determiner}${newBetween}${word}`;
      }
    });

    return res;
  }

  contractions(input: string): string {
    let res = input;
    res = this.ceCetGeneric(res, false);
    res = this.articlesContractionsGeneric(res, false);
    res = this.twoWordsContractions(res);
    return res;
  }

  titlecase(input: string): string {
    return titleCaseFrFr.convert(input);
  }

  cleanSpacesPunctuation(input: string): string {
    let res = input;

    // all but . and ,
    const regexAllButDot = new RegExp(
      `(${this.constants.spaceOrNonBlockingClass}*)([:!\\?;])(${this.constants.spaceOrNonBlockingClass}*)`,
      'g',
    );
    res = res.replace(regexAllButDot, function (_match: string, before: string, punc: string, after: string): string {
      // console.log(`${match} <${before}> <${after}>`);
      return `${before.replace(/\s/g, '')}\xa0${punc} ${after.replace(/\s/g, '')}`;
    });

    // . and , and …
    const regexDot = new RegExp(
      `(${this.constants.spaceOrNonBlockingClass}*)([\\.,…])(${this.constants.spaceOrNonBlockingClass}*)`,
      'g',
    );
    res = res.replace(regexDot, function (_match: string, before: string, punc: string, after: string): string {
      // console.log(`${match} <${before}> <${after}>`);
      return `${before.replace(/\s/g, '')}${punc} ${after.replace(/\s/g, '')}`;
    });
    //console.log('xxx ' + res);

    return res;
  }
}
