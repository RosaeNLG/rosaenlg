import { Constants } from 'rosaenlg-commons';

/*
  French: de + le => du
  Spanish: de + el => del
*/

export function contract2elts(
  rawFirstPart: string,
  secondPart: string,
  replacer: string,
  constants: Constants,
  input: string,
): string {
  // de => [d|D]e
  const firstPart = `[${rawFirstPart.substring(0, 1)}|${rawFirstPart
    .substring(0, 1)
    .toUpperCase()}]${rawFirstPart.substring(1)}`;
  // console.log(firstPart);

  const regexContr = new RegExp(
    `${constants.stdBeforeWithParenthesis}(${firstPart})${constants.stdBetweenWithParenthesis}${secondPart}${constants.stdBetweenWithParenthesis}`,
    'g',
  );
  return input.replace(regexContr, function (
    match: string,
    before: string,
    part1: string,
    between: string,
    after: string,
  ): string {
    const isUc = part1.substring(0, 1).toLowerCase() != part1.substring(0, 1);
    const newDet = isUc ? replacer.substring(0, 1).toUpperCase() + replacer.substring(1) : replacer;
    //return `${before}des ${(between + after).replace(/ /g, '')}`;
    return `${before}${newDet}${between}${after}`;
  });
}
