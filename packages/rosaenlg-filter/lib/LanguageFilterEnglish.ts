import { LanguageFilter } from './LanguageFilter';
import { getAAn } from 'english-a-an';
import anList from 'english-a-an-list';
import titleCaseEnUs from 'better-title-case';

export class LanguageFilterEnglish extends LanguageFilter {
  cleanSpacesPunctuationDoDefault = true;

  beforeProtect(input: string): string {
    let res = input;
    res = this.aAnGeneric(res, true);
    res = this.enPossessivesBeforeProtect(res);
    return res;
  }

  justBeforeUnprotect(input: string): string {
    let res = input;
    res = this.aAnGeneric(res, false);
    res = this.enPossessives(res);
    return res;
  }

  private enPossessives(input: string): string {
    let res = input;
    // console.log("xx: "+ input);

    // the <b>earrings</b> 's size => The <b>earrings</b>' size
    const regexSS = new RegExp("s([☞☜\\s]*)'s([^" + this.constants.tousCaracteresMinMajRe + '])', 'g');
    res = res.replace(regexSS, (_match, between, after): string => {
      // console.log(`${corresp} ${first} ${offset} ${orig}`);
      return `s${between}'${after}`;
    });
    return res;
  }

  private enPossessivesBeforeProtect(input: string): string {
    let res = input;
    // console.log("xx: "+ input);

    const regexSS = new RegExp("(s\\s*§[\\s¤]*'s)([^" + this.constants.tousCaracteresMinMajRe + '])', 'g');
    res = res.replace(regexSS, (_corresp, _first, second): string => {
      // console.log(`AAAA ${corresp} ${first} ${offset} ${orig}`);
      return `s§' ${second}`;
    });
    // console.log("yy: "+ res);
    return res;
  }

  private aAnGeneric(input: string, beforeProtect: boolean): string {
    let res = input;
    //console.log('xxx' + input);

    const regexA = new RegExp(
      `([^${this.constants.tousCaracteresMinMajRe}])([aA])${
        this.constants.stdBetweenWithParenthesis
      }(${this.constants.getInBetween(beforeProtect)})([${this.constants.tousCaracteresMinMajRe}]*)`,
      'g',
    );
    res = res.replace(regexA, (match, before, aA, between, beforeWord, word): string => {
      // console.log(`BEFORE PROTECT <${before}> <${aA}> <${between}> <${word}>`);
      if (word != null && word != '') {
        // can be null when orphan "a" at the very end of a text
        const newAa = this.redoCapitalization(aA, getAAn(this.dictManager.getAdjsWordsData(), anList, word));
        return `${before}${newAa}${between}${beforeWord}${word}`;
      } else {
        return match;
      }
    });
    //console.log('yyy' + res);
    return res;
  }

  private redoCapitalization(initial: string, replacement: string): string {
    if (initial === 'A') {
      return replacement.substring(0, 1).toUpperCase() + replacement.substring(1); // A or An...
    } else {
      return replacement;
    }
  }

  titlecase(input: string): string {
    return titleCaseEnUs(input);
  }

  cleanSpacesPunctuationCorrect(input: string): string {
    let res = input;

    // ['the phone \'s', 'The phone\'s'],
    res = res.replace(/\s*'/g, "'");

    return res;
  }
}
