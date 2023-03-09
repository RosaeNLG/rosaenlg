/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import * as tokenizer from 'wink-tokenizer';
import { blockLevelHtmlElts, inlineHtmlElts } from 'rosaenlg-filter';

export interface Stemmer {
  stemWord: (arg0: string) => string;
}

export abstract class LanguageSyn {
  iso2: string;
  stemmer: Stemmer;

  abstract getStandardStopWords(): string[];

  public extractWords(input: string): string[] {
    // console.log(`tokenizing: ${input}`);
    const myTokenizer = new tokenizer();

    myTokenizer.defineConfig({
      currency: false,
      number: false,
      punctuation: false,
      symbol: false,
      time: false,
    });

    const tokenized: tokenizer.Token[] = myTokenizer.tokenize(input);
    // console.log(`tokenized: ${tokenized}`);

    const res: string[] = [];
    tokenized.forEach((elt): void => {
      // no alien tags and no html elements
      if (
        elt.tag != 'alien' &&
        blockLevelHtmlElts.indexOf(elt.value) == -1 &&
        inlineHtmlElts.indexOf(elt.value) == -1
      ) {
        res.push(elt.value);
      }
    });

    // console.log(`res: ${res}`);

    return res;
  }
}
