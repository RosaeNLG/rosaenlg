/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageSyn } from './LanguageSyn';
import { buildLanguageSyn, getIso2fromLocale } from './helper';

interface WordsWithPos {
  [key: string]: number[];
}

interface IdenticalsMap {
  [key: string]: string;
}

export interface DebugHolder {
  filteredAlt?: string[];
  identicals?: string[][];
  identicalsMap?: IdenticalsMap;
  wordsWithPos?: WordsWithPos;
  score?: number;
}

export class SynOptimizer {
  private languageSyn: LanguageSyn;

  constructor(language: string) {
    this.languageSyn = buildLanguageSyn(getIso2fromLocale(language));
  }

  public getStopWords(stopWordsToAdd: string[], stopWordsToRemove: string[], stopWordsOverride: string[]): string[] {
    let baseList: string[];

    // the base list
    if (stopWordsOverride) {
      baseList = stopWordsOverride.slice(0);
    } else {
      baseList = this.languageSyn.getStandardStopWords();
    }

    // remove
    if (stopWordsToRemove) {
      baseList = baseList.filter((word: string): boolean => {
        return !stopWordsToRemove.includes(word);
      });
    }

    // and add
    if (stopWordsToAdd) {
      baseList = baseList.concat(stopWordsToAdd);
    }

    return baseList.map((alt: string): string => {
      return alt.toLowerCase();
    });
  }

  // this one is really used by RosaeNLG
  public scoreAlternative(
    alternative: string,
    stopWordsToAdd: string[],
    stopWordsToRemove: string[],
    stopWordsOverride: string[],
    identicals: string[][],
    debugHolder: DebugHolder,
  ): number {
    // console.log(stemmer.stemWord("baby"));

    // console.log(stopWordsToAdd);
    const stopwords: string[] = this.getStopWords(stopWordsToAdd, stopWordsToRemove, stopWordsOverride);
    // console.log(stopwords);

    const filteredAlt: string[] = this.getStemmedWords(alternative, stopwords);

    if (debugHolder) {
      debugHolder.filteredAlt = filteredAlt;
    }

    const wordsWithPos: WordsWithPos = this.getWordsWithPos(filteredAlt, identicals, debugHolder);

    if (debugHolder) {
      // only keep ones with > 1 for readability
      debugHolder.wordsWithPos = {};
      Object.keys(wordsWithPos).forEach((word): void => {
        /* istanbul ignore next */
        if (wordsWithPos[word].length > 1) {
          debugHolder.wordsWithPos[word] = wordsWithPos[word];
        }
      });
    }

    // console.log(wordsWithPos);
    // score
    const score: number = this.getScore(wordsWithPos);
    if (debugHolder) {
      debugHolder.score = score;
    }
    return score;

    // console.log(score);
  }

  public getStemmedWords(text: string, stopwords: string[]): string[] {
    // console.log(`getStemmedWords: ${text}`);
    const res = this.languageSyn
      .extractWords(text)
      .map((alt: string): string => {
        return alt.toLowerCase();
      })
      .filter((alt: string): boolean => {
        return !stopwords.includes(alt);
      })
      .map((elt) => {
        return this.stemWord(elt);
      });
    // console.log(`getStemmedWords result: ${res}`);
    return res;
  }

  // used only by tests
  public getBest(
    alternatives: string[],
    stopWordsToAdd: string[],
    stopWordsToRemove: string[],
    stopWordsOverride: string[],
    identicals: string[][],
  ): number {
    const scores: number[] = [];

    alternatives.forEach((alt): void => {
      scores.push(this.scoreAlternative(alt, stopWordsToAdd, stopWordsToRemove, stopWordsOverride, identicals, null));
    });

    return scores.indexOf(Math.min(...scores));
  }

  // exported for tests
  public getScore(wordsWithPos: WordsWithPos): number {
    let score = 0;

    Object.keys(wordsWithPos).forEach((word: string): void => {
      const positions: number[] = wordsWithPos[word];
      for (let j = 1; j < positions.length; j++) {
        score += 1 / (positions[j] - positions[j - 1]);
      }
    });

    return score;
  }

  public stemWord(word: string): string {
    if (this.languageSyn.stemmer) {
      //console.log(`ok ${lang} is valid`);

      //console.log(`orig: ${word}, stemmed: ${stemmersCache[lang].stemWord(word)}`);
      return this.languageSyn.stemmer.stemWord(word);
    }
    return word;
  }

  public getWordsWithPos(words: string[], identicals: string[][], debugHolder: DebugHolder): WordsWithPos {
    const identicalsMap: IdenticalsMap = {};
    if (identicals) {
      // check type
      if (!Array.isArray(identicals)) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `identicals must be a string[][]`;
        throw err;
      } else {
        identicals.forEach((identicalList): void => {
          if (!Array.isArray(identicalList)) {
            const err = new Error();
            err.name = 'InvalidArgumentError';
            err.message = `identicals must be a string[][]`;
            throw err;
          }
        });
      }

      if (debugHolder) {
        debugHolder.identicals = identicals;
      }

      // do the job
      identicals.forEach((identicalList): void => {
        const mapTo: string = identicalList.join('_');
        identicalList.forEach((identicalElt): void => {
          identicalsMap[this.stemWord(identicalElt)] = mapTo;
        });
      });
    }
    if (debugHolder) {
      debugHolder.identicalsMap = identicalsMap;
    }
    const wordsWithPos: WordsWithPos = {};
    for (let j = 0; j < words.length; j++) {
      const word: string = identicalsMap[words[j]] || words[j];

      if (!wordsWithPos[word]) {
        wordsWithPos[word] = [];
      }
      wordsWithPos[word].push(j);
    }

    return wordsWithPos;
  }
}
