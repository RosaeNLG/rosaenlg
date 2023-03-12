/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';

export class LanguageSynOther extends LanguageSyn {
  getStandardStopWords(): string[] {
    return [];
  }
}
