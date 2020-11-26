/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';
import stopwordsIt = require('stopwords-it');
import * as italianStemmer from 'snowball-stemmer.jsx/dest/italian-stemmer.common.js';

export class LanguageSynItalian extends LanguageSyn {
  iso2 = 'it';

  constructor() {
    super();
    this.stemmer = new italianStemmer.ItalianStemmer();
  }

  getStandardStopWords(): string[] {
    return stopwordsIt;
  }
}
