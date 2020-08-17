import { DictManager } from 'rosaenlg-commons';
import { contracts } from 'french-contractions';
import { contract2elts } from './contractionsHelper';
import { Constants, Languages } from 'rosaenlg-commons';

function getAfterDeterminer(constants: Constants, beforeProtect: boolean): string {
  return `${constants.stdBetweenWithParenthesis}(${constants.getInBetween(beforeProtect)})([${
    constants.toutesVoyellesMinMaj
  }hH][${constants.tousCaracteresMinMajRe}]*)`;
}

// ce arbre => cet arbre
function ceCetGeneric(
  input: string,
  _lang: Languages,
  constants: Constants,
  beforeProtect: boolean,
  dictManager: DictManager,
): string {
  let res = input;

  const regexCe = new RegExp(
    `${constants.stdBeforeWithParenthesis}([Cc]e)${getAfterDeterminer(constants, beforeProtect)}`,
    'g',
  );
  res = res.replace(regexCe, function (corresp, before, determiner, between, beforeWord, word): string {
    // console.log(`${before} ${determiner} ${word}`);
    const newBetween = between + beforeWord;
    if (contracts(word, dictManager.getAdjsWordsData())) {
      return `${before}${determiner}t${newBetween}${word}`;
    } else {
      // do nothing
      return `${before}${determiner}${newBetween}${word}`;
    }
  });

  return res;
}

export function ceCetAfter(input: string, _lang: Languages, constants: Constants, dictManager: DictManager): string {
  return ceCetGeneric(input, _lang, constants, false, dictManager);
}

function articlesContractionsGeneric(
  input: string,
  _lang: Languages,
  constants: Constants,
  beforeProtect: boolean,
  dictManager: DictManager,
): string {
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
      `${constants.stdBeforeWithParenthesis}(${contrList[i]})${getAfterDeterminer(constants, beforeProtect)}`,
      'g',
    );
    res = res.replace(regexDe, function (corresp, before, determiner, between, beforeWord, word): string {
      const newBetween = (between + beforeWord).replace(/[\s¤]+/g, ''); // we contract thus keep no space
      // console.log(`new between: <${newBetween}>`);
      if (contracts(word, dictManager.getAdjsWordsData())) {
        return `${before}${determiner.substring(0, determiner.length - 1)}'${newBetween}${word}`;
      } else {
        // do nothing
        return `${before}${newBetween}${determiner} ${word}`;
      }
    });
  }

  return res;
}

export function articlesContractionsAfter(
  input: string,
  _lang: Languages,
  constants: Constants,
  dictManager: DictManager,
): string {
  return articlesContractionsGeneric(input, _lang, constants, false, dictManager);
}

// de + voyelle, que + voyelle, etc.
export function twoWordsContractions(input: string, _lang: Languages, constants: Constants): string {
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
    res = contract2elts(contrList[i][0], contrList[i][1], contrList[i][2], constants, res);
  }

  return res;
}
