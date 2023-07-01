/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Constants } from './Constants';
import { DictManager } from './DictManager';

export abstract class LanguageCommon {
  protected iso2: string | null = null;

  protected validPropsWord: string[] | null = null; // MUST override
  protected validPropsAdj: string[] | null = null; // MUST override
  protected allPunctList = Constants.stdPunctList; // override e.g. for Spanish ¡¿

  public constants: Constants | null = null;
  public dictManager: DictManager | null = null;

  init(): void {
    this.dictManager = new DictManager(this.iso2, this.validPropsWord as string[], this.validPropsAdj as string[]);
    this.constants = new Constants(this.allPunctList);
  }

  setIso2(_iso2: string): void {
    const err = new Error();
    err.name = 'InvalidArgumentException';
    err.message = `cannot set iso2`;
    throw err;
  }
}
