/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';
import stopwordsDe = require('stopwords-de');
import * as germanStemmer from 'snowball-stemmer.jsx/dest/german-stemmer.common.js';

export class LanguageSynGerman extends LanguageSyn {
  constructor() {
    super('de', new germanStemmer.GermanStemmer());
  }

  getStandardStopWords(): string[] {
    return stopwordsDe;
  }
}
