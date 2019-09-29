import * as frenchWordsGender from 'french-words-gender';
import * as germanWords from 'german-words';
import * as italianAdjectives from 'italian-adjectives';
import * as italianWords from 'italian-words';
import * as germanAdjectives from 'german-adjectives';
import * as frenchVerbs from 'french-verbs';
import * as germanVerbs from 'german-verbs';
import * as italianVerbs from 'italian-verbs';
import { parse, visit } from 'recast';

//import * as Debug from 'debug';
//const debug = Debug('rosaenlg-pug-code-gen');

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | string;
export type GendersMF = 'M' | 'F';

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
    const res: VerbsData = {};
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
    const res: WordsData = {};
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
    const res: AdjectivesData = {};
    const language = this.language;
    this.adjectiveCandidates.forEach(function(adjectiveCandidate): void {
      switch (language) {
        case 'de_DE': {
          try {
            const adjData = germanAdjectives.getAdjectiveInfo(adjectiveCandidate, null);
            if (adjData) {
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
            if (adjData) {
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
    const candidate: string = extractor.apply(this, [args]);
    if (candidate) {
      store.push(candidate);
    }
  }

  public extractVerbCandidate(args: string): void {
    this.extractHelper(args, this.getVerbCandidate, this.verbCandidates);
  }

  public getVerbCandidate(args: string): string {
    const languagesWithVerbsToExtract = ['fr_FR', 'de_DE', 'it_IT'];
    if (!this.embedResources || languagesWithVerbsToExtract.indexOf(this.language) === -1) {
      return null;
    }

    // console.log(`extractVerbCandidate called on <${args}>`);

    const parsed = parse(args);
    // console.log("ooo " + JSON.stringify(parsed));

    const parsedExpr: any = parsed.program.body[0].expression;

    if (parsedExpr.expressions && parsedExpr.expressions.length > 1) {
      const secondArg = parsedExpr.expressions[1];
      // console.log("secondArg: " + JSON.stringify(secondArg));

      let found: string;
      if (secondArg.type === 'Literal') {
        // string second arg form
        found = secondArg.value;
        //console.log(`found string second arg form: ${found}`);
      } else {
        // "verb:"" form
        const self = this;
        visit(secondArg, {
          visitProperty: function(path) {
            if (self.keyEqualsTo(path.value, 'verb')) {
              if (path.value.value.type === 'Literal') {
                found = path.value.value.value;
                //console.log(`found verb: form: ${found}`);
                this.abort();
              }
            }
            this.traverse(path);
          },
        });
      }
      return found;
    }
  }

  private keyEqualsTo(prop: any, val: string): boolean {
    // when 'val':, is in value, when val:, is in name
    return prop.key.value === val || prop.key.name === val;
  }

  public extractWordCandidateFromSetRefGender(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromSetRefGender, this.wordCandidates);
  }
  public getWordCandidateFromSetRefGender(args: string): string {
    const languagesWithWordResources = ['de_DE', 'it_IT', 'fr_FR'];
    if (!this.embedResources || languagesWithWordResources.indexOf(this.language) === -1) {
      return;
    }

    // console.log(`getWordCandidateFromSetRefGender called on <${args}>`);

    const parsed = parse(args);
    const parsedExpr: any = parsed.program.body[0].expression;

    //console.log(JSON.stringify(parsedExpr));

    if (parsedExpr.expressions && parsedExpr.expressions.length >= 1) {
      // console.log(parsedExpr.expressions);
      const secondArg = parsedExpr.expressions[1];
      // console.log("secondArg: " + JSON.stringify(secondArg));

      if (secondArg.type === 'Literal') {
        // string second arg form
        /*
          - setRefGender(PRODUKT2, 'Gurke');
          is ok, but avoid:
          - setRefGender(PRODUKT, 'N');
        */
        if (secondArg.value !== 'M' && secondArg.value !== 'F' && secondArg.value !== 'N') {
          return secondArg.value;
        }
      }
    }
  }

  public extractAdjectiveCandidateFromAgreeAdj(args: string): void {
    this.extractHelper(args, this.getAdjectiveCandidateFromAgreeAdj, this.adjectiveCandidates);
  }
  public getAdjectiveCandidateFromAgreeAdj(args: string): string {
    const languagesWithAdjResources = ['de_DE', 'it_IT', 'fr_FR'];
    if (!this.embedResources || languagesWithAdjResources.indexOf(this.language) === -1) {
      return;
    }

    // console.log(`getAdjectiveCandidateFromAgreeAdj called on <${args}>`);

    const parsed = parse(args);
    const parsedExpr = parsed.program.body[0].expression;
    let firstArg: any;

    if (parsedExpr.expressions && parsedExpr.expressions.length >= 1) {
      // multiple args
      firstArg = parsedExpr.expressions[0];
    } else {
      // single argument
      firstArg = parsedExpr;
    }

    if (firstArg.type === 'Literal') {
      // second arg form must be string
      return firstArg.value;
    }
  }

  public extractAdjectiveCandidateFromValue(args: string): void {
    // cannot use extractHelper because returns a []
    const candidates = this.getAdjectiveCandidatesFromValue(args);
    this.adjectiveCandidates = this.adjectiveCandidates.concat(candidates);
  }
  public getAdjectiveCandidatesFromValue(args: string): string[] {
    const languagesWithAdjResourcesInValue = ['de_DE', 'it_IT', 'fr_FR'];

    if (!this.embedResources || languagesWithAdjResourcesInValue.indexOf(this.language) === -1) {
      return [];
    }

    const res = [];
    //console.log(`getAdjectiveCandidatesFromValue called on <${args}>`);

    const parsed = parse(args);
    // console.log("ooo " + JSON.stringify(parsed));

    const parsedExpr: any = parsed.program.body[0].expression;

    if (parsedExpr.expressions && parsedExpr.expressions.length > 1) {
      const secondArg = parsedExpr.expressions[1];
      // console.log("secondArg: " + JSON.stringify(secondArg));

      function addArrayToRes(elts: any): void {
        for (let i = 0; i < elts.length; i++) {
          if (elts[i].type === 'Literal') {
            res.push(elts[i].value);
          }
        }
      }

      const self = this;
      visit(secondArg, {
        visitProperty: function(path) {
          if (self.keyEqualsTo(path.value, 'adj')) {
            const pvv = path.value.value;
            if (pvv.type === 'Literal') {
              res.push(pvv.value);
            } else if (pvv.type === 'ArrayExpression') {
              const elts = pvv.elements;
              addArrayToRes(elts);
            } else if (pvv.type === 'ObjectExpression') {
              const props = pvv.properties;
              for (let i = 0; i < props.length; i++) {
                const prop = props[i];
                if (self.keyEqualsTo(prop, 'BEFORE') || self.keyEqualsTo(prop, 'AFTER')) {
                  addArrayToRes(prop.value.elements);
                }
              }
            }
          } else if (self.keyEqualsTo(path.value, 'possessiveAdj')) {
            // Italian possessiveAdj:
            if (path.value.value.type === 'Literal') {
              res.push(path.value.value.value);
            }
          }
          this.traverse(path);
        },
      });
    }

    return res;
  }

  public extractWordCandidateFromThirdPossession(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromThirdPossession, this.wordCandidates);
  }
  public getWordCandidateFromThirdPossession(args: string): string {
    // console.log(`getWordCandidateFromThirdPossession called on <${args}>`);
    if (!this.embedResources || (this.language != 'fr_FR' && this.language != 'de_DE')) {
      return;
    }

    // #[+thirdPossession(XXX, 'couleur')]

    const parsed = parse(args);
    const parsedExpr: any = parsed.program.body[0].expression;

    if (parsedExpr.expressions && parsedExpr.expressions.length > 1) {
      // console.log(parsedExpr.expressions);
      const secondArg = parsedExpr.expressions[1];
      // console.log("secondArg: " + JSON.stringify(secondArg));

      if (secondArg.type === 'Literal') {
        // string second arg form
        return secondArg.value;
      }
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
    if (args.indexOf('represents') === -1) {
      return null;
    }
    */

    const parsed = parse(args);

    const parsedExpr = parsed.program.body[0].expression;
    let firstArg: any;

    if (parsedExpr.expressions && parsedExpr.expressions.length >= 1) {
      // multiple args
      firstArg = parsedExpr.expressions[0];
    } else {
      // single argument
      firstArg = parsedExpr;
    }

    if (firstArg.type === 'Literal') {
      // second arg form must be string
      return firstArg.value;
    }
  }
}
