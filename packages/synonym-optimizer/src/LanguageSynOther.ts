/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';

export class LanguageSynOther extends LanguageSyn {
  constructor(iso2: string) {
    super(iso2, null);
  }

  getStandardStopWords(): string[] {
    return [];
  }
}
