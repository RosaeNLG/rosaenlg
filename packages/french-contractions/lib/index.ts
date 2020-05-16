export * from './hmuet';
export * from './vowel';
import { isH, isHAspire } from './hmuet';
import { beginsWithVowel, isContractedVowelWord } from './vowel';

export function contracts(word: string): boolean {
  if (beginsWithVowel(word) && isContractedVowelWord(word)) {
    return true;
  } else if (isH(word) && !isHAspire(word)) {
    return true;
  }

  return false;
}
