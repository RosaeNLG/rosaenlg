/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCommon } from './LanguageCommon';

export class LanguageCommonOther extends LanguageCommon {
  constructor() {
    super();
  }
  setIso2(iso2: string): void {
    this.iso2 = iso2;
  }
}
