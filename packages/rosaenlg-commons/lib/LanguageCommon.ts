import { Constants } from './Constants';
import { DictManager } from './DictManager';

export abstract class LanguageCommon {
  iso2: string;
  // override
  readonly validPropsWord: string[];
  // override
  readonly validPropsAdj: string[];
  allPunctList = Constants.stdPunctList; // override e.g. for Spanish ¡¿

  public constants: Constants;
  public dictManager: DictManager;

  init(): void {
    this.dictManager = new DictManager(this.iso2, this.validPropsWord, this.validPropsAdj);
    this.constants = new Constants(this.allPunctList);
  }

  setIso2(_iso2: string): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = `cannot set iso2`;
    throw err;
  }
}
