/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';
import stopwordsEn = require('stopwords-en');
import * as englishStemmer from 'snowball-stemmer.jsx/dest/english-stemmer.common.js';

export class LanguageSynEnglish extends LanguageSyn {
  constructor() {
    super('en', new englishStemmer.EnglishStemmer());
  }

  getStandardStopWords(): string[] {
    return stopwordsEn;
  }
}
