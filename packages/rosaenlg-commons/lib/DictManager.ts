/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

/*
  the real types are defined in rosaenlg-pug-code-gen
  import { WordsData, WordData, AdjectivesData, AdjectiveData } from 'rosaenlg-pug-code-gen';
  but dependency brings issues
*/

type WordData = any;
interface WordsData {
  [key: string]: WordData;
}

type AdjectiveData = any;
interface AdjectivesData {
  [key: string]: AdjectiveData;
}

/*
has not been implemented for verbs yet, that's all

type VerbData = any;
interface VerbsData {
  [key: string]: VerbData;
}
*/

export interface AdjsWordsData {
  [key: string]: AdjectiveData | WordData;
}

export class DictManager {
  private wordsData: WordsData;
  private adjsData: AdjectivesData;
  private validPropsWord: string[];
  private validPropsAdj: string[];
  private iso2: string;

  public constructor(iso2: string, validPropsWord: string[], validPropsAdj: string[]) {
    this.iso2 = iso2;
    this.validPropsWord = validPropsWord;
    this.validPropsAdj = validPropsAdj;
    this.wordsData = {};
    this.adjsData = {};
  }

  public setEmbeddedWords(embeddedWords: WordsData): void {
    this.wordsData = embeddedWords;
  }

  public setEmbeddedAdj(embeddedAdjs: AdjectivesData): void {
    this.adjsData = embeddedAdjs;
  }

  public getWordData(): WordsData {
    return this.wordsData;
  }
  public getAdjsData(): WordsData {
    return this.adjsData;
  }

  public getAdjsWordsData(): AdjsWordsData {
    return { ...this.adjsData, ...this.wordsData };
  }

  isValidPropWord(prop: string): boolean {
    return this.validPropsWord.indexOf(prop) > -1;
  }
  isValidPropAdj(prop: string): boolean {
    return this.validPropsAdj.indexOf(prop) > -1;
  }

  private checkProp(type: 'word' | 'adj', prop: string): void {
    if ((type === 'word' && !this.isValidPropWord(prop)) || (type === 'adj' && !this.isValidPropAdj(prop))) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `invalid property ${prop} as ${type} in ${this.iso2}`;
      throw err;
    }
  }

  public setAdjData(adj: string, adjData: AdjectiveData): void {
    if (!this.adjsData[adj]) {
      this.adjsData[adj] = {}; // not a direct copy, we want to check the keys
    }
    const keys = Object.keys(adjData);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.checkProp('adj', key);
      this.adjsData[adj][key] = adjData[key];
    }
  }

  public setWordData(word: string, wordData: WordData): void {
    if (!this.wordsData[word]) {
      this.wordsData[word] = {};
    }
    const keys = Object.keys(wordData);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.checkProp('word', key);
      this.wordsData[word][key] = wordData[key];
    }
  }
}
