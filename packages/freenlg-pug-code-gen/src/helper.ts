import * as frenchWordsGender from '@freenlg/french-words-gender';
import * as germanWords from '@freenlg/german-words';
import * as italianAdjectives from '@freenlg/italian-adjectives';
import * as italianWords from '@freenlg/italian-words';
import * as germanAdjectives from '@freenlg/german-adjectives';
import * as frenchVerbs from '@freenlg/french-verbs';
import * as germanVerbs from '@freenlg/german-verbs';
import * as italianVerbs from '@freenlg/italian-verbs';

//import * as Debug from 'debug';
//const debug = Debug('freenlg-pug-code-gen');

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | string;
export type GendersMF = 'M' | 'F';

const tousCaracteresMinMajRe = 'a-zaeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿA-ZAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ-';

export type VerbData = frenchVerbs.VerbInfo | germanVerbs.VerbInfo | italianVerbs.VerbInfo;
export interface VerbsData {
  [key: string]: VerbData;
}
export type WordData = GendersMF /* fr_FR */ | germanWords.WordInfo | italianWords.WordInfo;
export interface WordsData {
  [key: string]: WordData;
}
export type AdjectiveData = germanAdjectives.AdjectiveInfo | italianAdjectives.AdjectiveInfo;
export interface AdjectivesData {
  [key: string]: AdjectiveData;
}
export interface LinguisticResources {
  verbs: VerbsData;
  words: WordsData;
  adjectives: AdjectivesData;
}

export class CodeGenHelper {
  private language: Languages;
  private embedResources: boolean;

  private verbCandidates: string[] = [];
  private wordCandidates: string[] = [];
  private adjectiveCandidates: string[] = [];

  // test purposes
  public getVerbCandidates(): string[] {
    return this.verbCandidates;
  }
  public getWordCandidates(): string[] {
    return this.wordCandidates;
  }
  public getAdjectiveCandidates(): string[] {
    return this.adjectiveCandidates;
  }

  public constructor(language: Languages, embedResources: boolean) {
    this.language = language;
    this.embedResources = embedResources;
  }

  public getAllLinguisticResources(explicitResources: LinguisticResources): LinguisticResources {
    // 1. init
    let allLinguisticResources = {
      verbs: {},
      words: {},
      adjectives: {},
    };

    // 2. get explicit resources, already solved
    allLinguisticResources = {
      ...allLinguisticResources,
      ...explicitResources,
    };

    // 3. add found candidates
    // console.log(verbCandidates);
    allLinguisticResources.verbs = {
      ...this.getVerbCandidatesData(),
      ...allLinguisticResources.verbs,
    };

    allLinguisticResources.words = {
      ...this.getWordCandidatesData(),
      ...allLinguisticResources.words,
    };

    // console.log(wordCandidates);
    allLinguisticResources.adjectives = {
      ...this.getAdjectiveCandidatesData(),
      ...allLinguisticResources.adjectives,
    };

    return allLinguisticResources;
  }

  public getVerbCandidatesData(): VerbsData {
    let res: VerbsData = {};
    const language = this.language;
    this.verbCandidates.forEach(function(verbCandidate): void {
      switch (language) {
        case 'fr_FR': {
          try {
            res[verbCandidate] = frenchVerbs.getVerbInfo(verbCandidate);
          } catch (e) {
            console.log(`Could not find any data for fr_FR verb candidate ${verbCandidate}`);
          }
          break;
        }
        case 'de_DE': {
          try {
            res[verbCandidate] = germanVerbs.getVerbInfo(verbCandidate, null);
          } catch (e) {
            console.log(`Could not find any data for de_DE verb candidate ${verbCandidate}`);
          }
          break;
        }
        case 'it_IT': {
          try {
            res[verbCandidate] = italianVerbs.getVerbInfo(verbCandidate, null);
          } catch (e) {
            console.log(`Could not find any data for it_IT verb candidate ${verbCandidate}`);
          }
          break;
        }
      }
    });

    return res;
  }

  public getWordCandidatesData(): WordsData {
    let res: WordsData = {};
    const language = this.language;
    this.wordCandidates.forEach(function(wordCandidate): void {
      switch (language) {
        case 'fr_FR': {
          try {
            res[wordCandidate] = frenchWordsGender.getGenderFrenchWord(wordCandidate, null);
          } catch (e) {
            console.log(`Could not find any data for fr_FR word candidate ${wordCandidate}`);
          }
          break;
        }
        case 'de_DE': {
          try {
            res[wordCandidate] = germanWords.getWordInfo(wordCandidate, null);
          } catch (e) {
            console.log(`Could not find any data for de_DE word candidate ${wordCandidate}`);
          }
          break;
        }
        case 'it_IT': {
          try {
            res[wordCandidate] = italianWords.getWordInfo(wordCandidate, null);
          } catch (e) {
            console.log(`Could not find any data for it_IT word candidate ${wordCandidate}`);
          }
          break;
        }
      }
    });

    return res;
  }

  public getAdjectiveCandidatesData(): AdjectivesData {
    let res: AdjectivesData = {};
    const language = this.language;
    this.adjectiveCandidates.forEach(function(adjectiveCandidate): void {
      switch (language) {
        case 'de_DE': {
          try {
            const adjData = germanAdjectives.getAdjectiveInfo(adjectiveCandidate, null);
            if (adjData != null) {
              res[adjectiveCandidate] = adjData;
            }
          } catch (e) /* istanbul ignore next */ {
            console.log(`Could not find any data for de_DE adjective candidate ${adjectiveCandidate}`);
          }
          break;
        }
        case 'it_IT': {
          try {
            const adjData = italianAdjectives.getAdjectiveInfo(adjectiveCandidate, null);
            if (adjData != null) {
              res[adjectiveCandidate] = adjData;
            }
          } catch (e) /* istanbul ignore next */ {
            console.log(`Could not find any data for it_IT adjective candidate ${adjectiveCandidate}`);
          }
          break;
        }
      }
    });

    return res;
  }

  private extractHelper(args, extractor: Function, store: string[]): void {
    let candidate: string = extractor.apply(this, [args]);
    if (candidate != null) {
      store.push(candidate);
    }
  }

  public extractVerbCandidate(args: string): void {
    this.extractHelper(args, this.getVerbCandidate, this.verbCandidates);
  }

  public getVerbCandidate(args: string): string {
    const languagesWithVerbsToExtract = ['fr_FR', 'de_DE', 'it_IT'];
    if (!this.embedResources || languagesWithVerbsToExtract.indexOf(this.language) == -1) {
      return null;
    }

    //console.log(`extractVerbCandidate called on <${args}>`);

    // 1. try verb: form
    {
      const findVerb1stFormRe = new RegExp(`verb['"]?\\s*:\\s*['"]([${tousCaracteresMinMajRe}]+)['"]`);
      let extractRes: RegExpExecArray = findVerb1stFormRe.exec(args);
      //console.log(extractRes);
      if (extractRes != null && extractRes.length >= 2) {
        return extractRes[1];
      }
    }

    // 2. try second arg
    {
      const splitArgs: string[] = args.split(',');
      if (splitArgs.length >= 2) {
        const findVerb2ndFormRe = new RegExp(`['"]([${tousCaracteresMinMajRe}]+)['"]`);
        let extractRes2nd: RegExpExecArray = findVerb2ndFormRe.exec(args);
        if (extractRes2nd != null && extractRes2nd.length >= 2) {
          return extractRes2nd[1];
        }
      }
    }
  }

  public extractWordCandidateFromSetRefGender(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromSetRefGender, this.wordCandidates);
  }
  public getWordCandidateFromSetRefGender(args: string): string {
    if (!this.embedResources || (this.language != 'fr_FR' && this.language != 'de_DE' && this.language != 'it_IT')) {
      return;
    }

    // console.log(`extractWordCandidateFromSetRefGender called on <${args}>`);

    const findWordRe = new RegExp(`['"]([${tousCaracteresMinMajRe}]+)['"]`);
    let extractRes: RegExpExecArray = findWordRe.exec(args);
    if (extractRes != null && extractRes.length >= 2) {
      /*
        - setRefGender(PRODUKT2, 'Gurke');
        is ok, but avoid:
        - setRefGender(PRODUKT, 'N');
      */
      if (extractRes[1] != 'M' && extractRes[1] != 'F' && extractRes[1] != 'N') {
        return extractRes[1];
      }
    }

    return null;
  }

  public extractAdjectiveCandidateFromAgreeAdj(args: string): void {
    this.extractHelper(args, this.getAdjectiveCandidateFromAgreeAdj, this.adjectiveCandidates);
  }
  public getAdjectiveCandidateFromAgreeAdj(args: string): string {
    if (!this.embedResources || (this.language != 'de_DE' && this.language != 'it_IT')) {
      return;
    }

    //console.log(`extractAdjectiveCandidateFromAgreeAdj called on <${args}>`);

    const findAdjRe = new RegExp(`^\\s*['"]([${tousCaracteresMinMajRe}]+)['"]`);
    let extractRes: RegExpExecArray = findAdjRe.exec(args);
    if (extractRes != null && extractRes.length >= 2) {
      return extractRes[1];
    }
  }

  public extractAdjectiveCandidateFromValue(args: string): void {
    // cannot use extractHelper because returns a []
    let candidates = this.getAdjectiveCandidatesFromValue(args);
    this.adjectiveCandidates = this.adjectiveCandidates.concat(candidates);
  }
  public getAdjectiveCandidatesFromValue(args: string): string[] {
    if (!this.embedResources || (this.language != 'de_DE' && this.language != 'it_IT')) {
      return [];
    }

    let res = [];
    //console.log(`extractAdjectiveCandidateFromValue called on <${args}>`);

    {
      const findAdj = new RegExp(`adj['"]?\\s*:\\s*['"]([${tousCaracteresMinMajRe}]+)['"]`);
      let extractRes: RegExpExecArray = findAdj.exec(args);
      if (extractRes != null && extractRes.length >= 2) {
        res.push(extractRes[1]);
      }
    }
    {
      const findPossessiveAdj = new RegExp(`possessiveAdj['"]?\\s*:\\s*['"]([${tousCaracteresMinMajRe}]+)['"]`);
      let extractRes: RegExpExecArray = findPossessiveAdj.exec(args);
      if (extractRes != null && extractRes.length >= 2) {
        res.push(extractRes[1]);
      }
    }

    return res;
  }

  public extractWordCandidateFromThirdPossession(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromThirdPossession, this.wordCandidates);
  }
  public getWordCandidateFromThirdPossession(args: string): string {
    //console.log(`extractWordCandidateFromThirdPossession called on <${args}>`);
    if (!this.embedResources || (this.language != 'fr_FR' && this.language != 'de_DE')) {
      return;
    }

    // #[+thirdPossession(XXX, 'couleur')]
    const findWordRe = new RegExp(`,\\s*['"]([${tousCaracteresMinMajRe}]+)['"]`);
    let extractRes: RegExpExecArray = findWordRe.exec(args);
    if (extractRes != null && extractRes.length >= 2) {
      return extractRes[1];
    }
  }

  public extractWordCandidateFromValue(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromValue, this.wordCandidates);
  }
  public getWordCandidateFromValue(args: string): string {
    if (!this.embedResources || (this.language != 'fr_FR' && this.language != 'de_DE' && this.language != 'it_IT')) {
      return;
    }

    //console.log(`extractWordCandidateFromValue called on <${args}>`);

    /*
    no: it is also useful when adj is here, to make the agreement!
    if (args.indexOf('represents') == -1) {
      return null;
    }
    */

    const findWordRe = new RegExp(`\\s*['"]([${tousCaracteresMinMajRe}]+)['"]`);
    let extractRes: RegExpExecArray = findWordRe.exec(args);
    //console.log(extractRes);
    if (extractRes != null && extractRes.length >= 2) {
      return extractRes[1];
    }

    return null;
  }
}
