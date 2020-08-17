import { Constants, Languages } from 'rosaenlg-commons';
import { contract2elts } from './contractionsHelper';

export function contractions(input: string, _lang: Languages, constants: Constants): string {
  let res = input;

  // de + el => del
  res = contract2elts('de', 'el', 'del', constants, res);

  // a + el => al
  res = contract2elts('a', 'el', 'al', constants, res);

  return res;
}
