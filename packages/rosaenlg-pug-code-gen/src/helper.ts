/**
 * @license
 * Copyright 2018, Ludan Stoecklé
 * SPDX-License-Identifier: MIT
 */

import { getIso2fromLocale, buildLanguageCodeGen } from './languageCodeGenHelper';
import {
  VerbInfo,
  VerbsInfo,
  AdjectiveInfo,
  AdjectivesInfo,
  WordInfo,
  WordsInfo,
  LinguisticResources,
} from 'rosaenlg-commons';
import { LanguageCodeGen } from './LanguageCodeGen';

import { parse, visit } from 'recast';

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | 'es_ES' | string;
export type GendersMF = 'M' | 'F';

interface LinguisticResourcesToSolve {
  verbs: string[];
  words: string[];
  adjectives: string[];
}

function keyEqualsTo(prop: any, val: string): boolean {
  // when 'val':, is in value, when val:, is in name
  return prop.key.value === val || prop.key.name === val;
}

export class CodeGenHelper {
  private iso2: string;
  private embedResources: boolean;

  private verbCandidates: string[] = [];
  private wordCandidates: string[] = [];
  private adjectiveCandidates: string[] = [];

  private languageCodeGen: LanguageCodeGen;

  // public for test purposes
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
    this.embedResources = embedResources;
    this.languageCodeGen = buildLanguageCodeGen(getIso2fromLocale(language));
    this.iso2 = this.languageCodeGen.iso2;
  }

  public getAllLinguisticResources(linguisticResourcesToSolve: LinguisticResourcesToSolve): LinguisticResources {
    // 1. init
    const allLinguisticResources: LinguisticResources = {
      verbs: {},
      words: {},
      adjectives: {},
    };

    // 2. get explicit resources, already solved
    if (linguisticResourcesToSolve && linguisticResourcesToSolve.verbs) {
      allLinguisticResources.verbs = this.languageCodeGen.getVerbsInfo(linguisticResourcesToSolve.verbs);
    }
    if (linguisticResourcesToSolve && linguisticResourcesToSolve.words) {
      allLinguisticResources.words = this.languageCodeGen.getWordsInfo(linguisticResourcesToSolve.words);
    }
    if (linguisticResourcesToSolve && linguisticResourcesToSolve.adjectives) {
      allLinguisticResources.adjectives = this.languageCodeGen.getAdjectivesInfo(linguisticResourcesToSolve.adjectives);
    }

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

    allLinguisticResources.adjectives = {
      ...this.getAdjectiveCandidatesData(),
      ...allLinguisticResources.adjectives,
    };

    return allLinguisticResources;
  }

  public getVerbCandidatesData(): VerbsInfo {
    const res: VerbsInfo = {};
    if (this.languageCodeGen.hasFlexVerbs) {
      for (const verbCandidate of this.verbCandidates) {
        try {
          const verbInfo: VerbInfo = this.languageCodeGen.getVerbInfo(verbCandidate);
          if (!verbInfo) throw new Error();
          res[verbCandidate] = verbInfo;
        } catch (e) {
          console.log(`Could not find any data for ${this.iso2} verb candidate ${verbCandidate}`);
        }
      }
    }
    return res;
  }

  public getWordCandidatesData(): WordsInfo {
    const res: WordsInfo = {};
    if (this.languageCodeGen.hasFlexWords) {
      for (const wordCandidate of this.wordCandidates) {
        try {
          const wordInfo: WordInfo = this.languageCodeGen.getWordInfo(wordCandidate);
          /* istanbul ignore next */
          if (!wordInfo) throw new Error();
          // in English we have more than just the irregular ones, but it's not a problem
          res[wordCandidate] = this.languageCodeGen.getWordInfo(wordCandidate);
        } catch (e) {
          console.log(`Could not find any data for ${this.iso2} word candidate ${wordCandidate}`);
        }
      }
    }
    return res;
  }

  public getAdjectiveCandidatesData(): AdjectivesInfo {
    const res: AdjectivesInfo = {};
    if (this.languageCodeGen.hasFlexAdjectives) {
      for (const adjectiveCandidate of this.adjectiveCandidates) {
        try {
          const adjectiveInfo: AdjectiveInfo = this.languageCodeGen.getAdjectiveInfo(adjectiveCandidate);
          /* istanbul ignore next */
          if (!adjectiveInfo) throw new Error();
          res[adjectiveCandidate] = adjectiveInfo;
        } catch (e) {
          console.log(`Could not find any data for ${this.iso2} adjective candidate ${adjectiveCandidate}`);
        }
      }
    }
    return res;
  }

  private extractHelper(args, extractor: (arg0: string) => string | string[], store: string[]): void {
    const candidate: string | string[] = extractor.apply(this, [args]);
    if (typeof candidate === 'string') {
      store.push(candidate);
    } /* istanbul ignore next */ else if (Array.isArray(candidate)) {
      // string[]
      store.push(...candidate);
    }
  }

  public extractVerbCandidate(args: string): void {
    this.extractHelper(args, this.getVerbCandidate, this.verbCandidates);
  }

  public getVerbCandidate(args: string): string[] {
    if (!this.embedResources || !this.languageCodeGen.hasFlexVerbs) {
      return;
    }
    const parsedExpr = this.getParsedExpr(args);
    this.checkAtLeastParams(parsedExpr, 2);

    const secondArg = parsedExpr[1];
    const isLitteralOrArray = (elt: any): boolean => elt.type === 'Literal' || elt.type === 'ArrayExpression';

    let found: any;
    if (isLitteralOrArray(secondArg)) {
      // string second arg form, or an array
      found = secondArg;
    } else {
      // "verb:"" form
      visit(secondArg, {
        visitProperty: function (path) {
          if (keyEqualsTo(path.value, 'verb')) {
            if (isLitteralOrArray(path.value.value)) {
              found = path.value.value;
              this.abort();
            }
          }
          this.traverse(path);
        },
      });
    }

    return this.getEltsFromEltOrListArg(found);
  }

  public extractWordCandidateFromVerbalForm(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromVerbalForm, this.wordCandidates);
  }

  public getWordCandidateFromVerbalForm(args: string): string[] {
    if (!this.embedResources || !this.languageCodeGen.hasFlexWords) {
      return;
    }

    const parsedExpr = this.getParsedExpr(args);
    this.checkAtLeastParams(parsedExpr, 1);

    return this.getEltsFromEltOrListArg(parsedExpr[0]);
  }
  public extractWordCandidateFromSetRefGender(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromSetRefGender, this.wordCandidates);
  }
  public getWordCandidateFromSetRefGender(args: string): string {
    if (!this.embedResources || !this.languageCodeGen.hasFlexWords) {
      return;
    }

    const parsedExpr = this.getParsedExpr(args);
    this.checkAtLeastParams(parsedExpr, 2);

    const val = this.getStringFromArg(parsedExpr[1]);

    if (val != null && val !== 'M' && val !== 'F' && val !== 'N') {
      return val;
    }
  }

  private getEltsFromEltOrListArg(arg: any): string[] {
    const res = [];

    if (!arg) {
      return [];
    }

    const isStringLiteral = (elt: any): boolean => elt.type === 'Literal' && typeof elt.value === 'string';

    if (isStringLiteral(arg)) {
      // one single adj
      res.push(arg.value);
    } else if (arg.type == 'ArrayExpression') {
      for (const elt of arg.elements) {
        if (isStringLiteral(elt)) {
          res.push(elt.value);
        }
      }
    }
    return res;
  }

  public extractAdjCandidateFromSubjectVerbAdj(args: string): void {
    this.extractHelper(args, this.getAdjCandidateFromSubjectVerbAdj, this.adjectiveCandidates);
  }

  public getAdjCandidateFromSubjectVerbAdj(args: string): string[] {
    if (!this.embedResources || !this.languageCodeGen.hasFlexAdjectives) {
      return;
    }

    const parsedExpr = this.getParsedExpr(args);
    // there are always 3 args (S + V + A), sometimes 4 when extra params
    this.checkAtLeastParams(parsedExpr, 3);

    return this.getEltsFromEltOrListArg(parsedExpr[2]);
  }

  public extractAdjectiveCandidateFromAgreeAdj(args: string): void {
    this.extractHelper(args, this.getAdjectiveCandidateFromAgreeAdj, this.adjectiveCandidates);
  }
  public getAdjectiveCandidateFromAgreeAdj(args: string): string[] {
    if (!this.embedResources || !this.languageCodeGen.hasFlexAdjectives) {
      return;
    }

    const parsedExpr = this.getParsedExpr(args);

    // there are always 2 args
    this.checkAtLeastParams(parsedExpr, 2);

    return this.getEltsFromEltOrListArg(parsedExpr[0]);
  }

  public extractAdjectiveCandidateFromValue(args: string): void {
    this.extractHelper(args, this.getAdjectiveCandidatesFromValue, this.adjectiveCandidates);
  }
  public getAdjectiveCandidatesFromValue(args: string): string[] {
    if (!this.embedResources || !this.languageCodeGen.hasFlexAdjectives) {
      return [];
    }

    const res = [];

    const parsedExpr = this.getParsedExpr(args);

    // form with 1 element is acceptable: we should not throw an exception
    this.checkAtLeastParams(parsedExpr, 1);

    // but we are only interested in the other arguments
    if (parsedExpr.length > 1) {
      const secondArg = parsedExpr[1];

      function addArrayToRes(elts: any): void {
        for (const elt of elts) {
          if (elt.type === 'Literal') {
            res.push(elt.value);
          }
        }
      }

      visit(secondArg, {
        visitProperty: function (path) {
          if (keyEqualsTo(path.value, 'adj')) {
            const pvv = path.value.value;
            switch (pvv.type) {
              case 'Literal': {
                res.push(pvv.value);
                break;
              }
              case 'ArrayExpression': {
                addArrayToRes(pvv.elements);
                break;
              }
              case 'ObjectExpression': {
                const props = pvv.properties;
                for (const prop of props) {
                  if (keyEqualsTo(prop, 'BEFORE') || keyEqualsTo(prop, 'AFTER')) {
                    addArrayToRes(prop.value.elements);
                  }
                }
                break;
              }
            }
          } else if (keyEqualsTo(path.value, 'possessiveAdj')) {
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
  public getWordCandidateFromThirdPossession(args: string): string[] {
    if (!this.embedResources || !this.languageCodeGen.hasFlexWords) {
      return;
    }

    const res = [];

    // #[+thirdPossession(XXX, 'couleur')]
    // there can be 2 words

    const parsedExpr = this.getParsedExpr(args);
    // there must be 2 parameters
    this.checkAtLeastParams(parsedExpr, 2);

    for (let i = 0; i <= 1; i++) {
      const str = this.getStringFromArg(parsedExpr[i]);
      if (str) {
        res.push(str);
      }
    }

    return res;
  }

  public checkAtLeastParams(parsedExpr: any, atLeast: number): void {
    if (!parsedExpr) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `parsed expression is null`;
      throw err;
    } else if (parsedExpr.length < atLeast) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `has ${parsedExpr.length} parameters while should have at least ${atLeast}`;
      throw err;
    }
  }

  public getParsedExpr(args: any): any {
    if (!args) {
      return null;
    }
    const parsed = parse(args);

    // looks like it always has this structure
    const expression = parsed.program.body[0].expression;
    if (expression.expressions) {
      return expression.expressions;
    } else {
      // when there is only 1 argument, like some value cases
      // we just put in an array to look like the others
      // console.log(parsed.program.body[0].expression);
      return [expression];
    }
  }

  public getStringFromArg(arg: any): string {
    if (arg.type === 'Literal' && typeof arg.value === 'string') {
      // string second arg form
      return arg.value;
    }
    return null;
  }

  public extractWordCandidateFromValue(args: string): void {
    this.extractHelper(args, this.getWordCandidateFromValue, this.wordCandidates);
  }
  public getWordCandidateFromValue(args: string): string[] {
    // en_US to get the plurals
    if (!this.embedResources || !this.languageCodeGen.hasFlexWords) {
      return;
    }

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

    return this.getEltsFromEltOrListArg(firstArg);
  }
}
