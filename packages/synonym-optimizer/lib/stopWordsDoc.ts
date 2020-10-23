import * as fs from 'fs';
import { getStandardStopWords } from './index';

function generateStopWordsDoc(dest: string): void {
  const stream = fs.createWriteStream(dest, 'utf-8');
  const languages = ['fr_FR', 'de_DE', 'it_IT', 'en_US', 'es_ES'];
  stream.write(`:page-partial:\n\n`);
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    stream.write(`== ${language}\n\n`);
    const stopWords = getStandardStopWords(language);
    stream.write(stopWords.join(' - '));
    stream.write(`\n\n\n`);
  }
  stream.end();
}

generateStopWordsDoc('../rosaenlg-doc/doc/modules/mixins_ref/pages/stopwords_generated.adoc');
