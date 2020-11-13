import { LanguageSyn } from './LanguageSyn';
import stopwordsEn = require('stopwords-en');
import * as englishStemmer from 'snowball-stemmer.jsx/dest/english-stemmer.common.js';

export class LanguageSynEnglish extends LanguageSyn {
  iso2 = 'en';

  constructor() {
    super();
    this.stemmer = new englishStemmer.EnglishStemmer();
  }

  getStandardStopWords(): string[] {
    return stopwordsEn;
  }
}
