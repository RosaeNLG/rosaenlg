import { LanguageCodeGen } from './LanguageCodeGen';

export class LanguageCodeGenOther extends LanguageCodeGen {
  setIso2(iso2: string): void {
    this.iso2 = iso2;
  }
}
