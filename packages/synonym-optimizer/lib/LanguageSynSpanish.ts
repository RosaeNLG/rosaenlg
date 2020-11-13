import { LanguageSyn } from './LanguageSyn';
import stopwordsEs = require('stopwords-es');
import * as spanishStemmer from 'snowball-stemmer.jsx/dest/spanish-stemmer.common.js';

export class LanguageSynSpanish extends LanguageSyn {
  iso2 = 'es';

  constructor() {
    super();
    this.stemmer = new spanishStemmer.SpanishStemmer();
  }

  getStandardStopWords(): string[] {
    return stopwordsEs;
  }
}
