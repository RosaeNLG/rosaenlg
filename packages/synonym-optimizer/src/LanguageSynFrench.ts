/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';
import stopwordsFr = require('stopwords-fr');
import * as frenchStemmer from 'snowball-stemmer.jsx/dest/french-stemmer.common.js';

export class LanguageSynFrench extends LanguageSyn {
  iso2 = 'fr';

  constructor() {
    super();
    this.stemmer = new frenchStemmer.FrenchStemmer();
  }

  getStandardStopWords(): string[] {
    return stopwordsFr;
  }

  public extractWords(input: string): string[] {
    let res = super.extractWords(input);

    // we just leave [Pp]uisqu [Jj]usqu [Ll]orsqu as they are
    const regexp = new RegExp("^(D|d|Q|q|L|l|S|s|J|j|T|t|M|m|N|n)'", 'g');
    res = res.map((elt: string) => {
      return elt.replace(regexp, '');
    });
    // sometimes it results in having empty elements
    res = res.filter((elt) => elt.length > 0);

    return res;
  }
}
