/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import { LanguageSyn } from './LanguageSyn';
import { buildLanguageSyn, getIso2fromLocale } from './helper';

function generateStopWordsDoc(dest: string): void {
  const stream = fs.createWriteStream(dest, 'utf-8');
  const languages = ['fr_FR', 'de_DE', 'it_IT', 'en_US', 'es_ES'];
  stream.write(`:page-partial:\n\n`);
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    stream.write(`== ${language}\n\n`);
    const languageSyn: LanguageSyn = buildLanguageSyn(getIso2fromLocale(language));
    const stopWords = languageSyn.getStandardStopWords();
    stream.write(stopWords.join(' - '));
    stream.write(`\n\n\n`);
  }
  stream.end();
}

generateStopWordsDoc('../rosaenlg-doc/doc/modules/mixins_ref/pages/stopwords_generated.adoc');
