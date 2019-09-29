interface Mappings {
  [key: string]: string;
}

export class ProtectMapping {
  public protectedString: string;
  public mappings: Mappings;
  public constructor(protectedString, mappings) {
    this.protectedString = protectedString;
    this.mappings = mappings;
  }
}

export function unprotect(toUnprotect: string, mappings: Mappings): string {
  // debug('input: ' + toUnprotect + ' / mappings: ' + JSON.stringify(mappings));
  let res: string = toUnprotect;
  for (const key in mappings) {
    // debug('key/val: ' + key + '/' + mappings[key]);
    res = res.replace(key, mappings[key]);
  }

  return res;
}

export function protectBlocks(input: string): ProtectMapping {
  const regexProtect = new RegExp('§([^§]*)§', 'g');

  const mappings: Mappings = {};

  let index = 0;
  const protectedInput: string = input.replace(regexProtect, function(corresp, first): string {
    // debug("§§§ :<" + corresp + '>' + first);
    // must not start with E otherwise creates issues with French constractions: d'ESCAPED
    const replacement = 'XESCAPED_SEQ_' + ++index;
    mappings[replacement] = first;
    return replacement;
  });

  // debug('escaped: ' + protectedInput);
  return new ProtectMapping(protectedInput, mappings);
}
