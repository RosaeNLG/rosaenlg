import { Languages } from './constants';

/*
  the real types are defined in rosaenlg-pug-code-gen
  import { WordsData, WordData, AdjectivesData, AdjectiveData } from 'rosaenlg-pug-code-gen';
  but dependancy brings issues
*/

type WordData = any;
interface WordsData {
  [key: string]: WordData;
}

type AdjectiveData = any;
interface AdjectivesData {
  [key: string]: AdjectiveData;
}

export interface AdjsWordsData {
  [key: string]: AdjectiveData | WordData;
}

export class DictManager {
  private language: Languages;
  private wordsData: WordsData;
  private adjsData: AdjectivesData;

  public constructor(language: Languages) {
    this.language = language;
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

  private checkProp(type: 'word' | 'adj', prop: string): void {
    const validProps = {
      word: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        fr_FR: ['plural', 'gender', 'contracts'],
        // eslint-disable-next-line @typescript-eslint/camelcase
        en_US: ['plural', 'aan'],
        // eslint-disable-next-line @typescript-eslint/camelcase
        de_DE: ['G', 'DAT', 'GEN', 'AKK', 'NOM'], // TODO check 1 level deeper SIN PLU
        // eslint-disable-next-line @typescript-eslint/camelcase
        it_IT: ['G', 'S', 'P'],
        // eslint-disable-next-line @typescript-eslint/camelcase
        es_ES: ['plural', 'gender'],
      },
      adj: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        en_US: ['aan'],
        // eslint-disable-next-line @typescript-eslint/camelcase
        fr_FR: ['contracts', 'MS', 'MP', 'FS', 'FP'],
        // eslint-disable-next-line @typescript-eslint/camelcase
        de_DE: ['AKK', 'DAT', 'GEN', 'NOM'], // TODO check 1 level deeper
        // eslint-disable-next-line @typescript-eslint/camelcase
        it_IT: ['MS', 'MP', 'FS', 'FP'],
        // eslint-disable-next-line @typescript-eslint/camelcase
        es_ES: ['MStrue', 'MPtrue', 'FStrue', 'FPtrue', 'MSfalse', 'MPfalse', 'FSfalse', 'FPfalse'],
      },
    };
    if (!validProps[type] || !validProps[type][this.language] || validProps[type][this.language].indexOf(prop) == -1) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `invalid property ${prop} as ${type} in ${this.language}`;
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
