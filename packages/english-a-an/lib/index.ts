export interface AnList {
  [key: string]: number;
}

// manual ones
const moreExceptions: AnList = { Irishman: 1, SSO: 1, HEPA: 1, AI: 1, honour: 1 };

export function getAAn(anList: AnList, text: string): 'a' | 'an' {
  if (!text) {
    const err = new Error();
    err.name = 'TypeError';
    err.message = 'text must not be null';
    throw err;
  }
  if ((anList && anList[text] == 1) || (moreExceptions && moreExceptions[text] == 1)) {
    return 'an';
  }
  return 'a';
}
