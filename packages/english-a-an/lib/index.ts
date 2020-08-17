export interface AnList {
  [key: string]: number;
}

interface ContractData {
  aan: 'a' | 'an';
}
interface ContractsData {
  [key: string]: ContractData;
}

// manual ones
const moreExceptions: AnList = { Irishman: 1, SSO: 1, HEPA: 1, AI: 1, honour: 1 };

export function getAAn(contractsData: ContractsData, anList: AnList, text: string): 'a' | 'an' {
  if (!text) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'text must not be null';
    throw err;
  }
  if (contractsData && contractsData[text] && contractsData[text].aan) {
    return contractsData[text].aan;
  } else if ((anList && anList[text] == 1) || (moreExceptions && moreExceptions[text] == 1)) {
    return 'an';
  }
  return 'a';
}
