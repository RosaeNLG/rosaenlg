/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

export * from './hmuet';
export * from './vowel';
import { isH, isHAspire } from './hmuet';
import { beginsWithVowel, isContractedVowelWord } from './vowel';

interface ContractData {
  contracts: boolean;
}
export interface ContractsData {
  [key: string]: ContractData;
}

export function contracts(word: string, contractsData: ContractsData | undefined): boolean {
  if (contractsData && contractsData[word] && contractsData[word].contracts != null) {
    return contractsData[word].contracts;
  } else if (beginsWithVowel(word) && isContractedVowelWord(word)) {
    return true;
  } else if (isH(word) && !isHAspire(word)) {
    return true;
  }
  return false;
}
