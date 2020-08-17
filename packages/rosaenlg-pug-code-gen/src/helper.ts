// en_US
import englishVerbsIrregular from 'english-verbs-irregular';
import englishVerbsGerunds from 'english-verbs-gerunds';
import * as englishVerbs from 'english-verbs-helper';
import englishPluralsList from 'english-plurals-list';
import * as englishPlurals from 'english-plurals';
// fr_fr
import * as frenchWords from 'french-words';
import frenchWordsGenderLefff from 'french-words-gender-lefff';
import * as frenchVerbs from 'french-verbs';
import frenchVerbsDict from 'french-verbs-lefff';
import * as frenchAdjectivesWrapper from 'french-adjectives-wrapper';
// de_DE
import * as germanWords from 'german-words';
import germanWordsDict from 'german-words-dict';
import * as germanAdjectives from 'german-adjectives';
import germanAdjectivesDict from 'german-adjectives-dict';
import * as germanVerbs from 'german-verbs';
import germanVerbsDict from 'german-verbs-dict';
// it_IT
import * as italianAdjectives from 'italian-adjectives';
import italianAdjectivesDict from 'italian-adjectives-dict';
import * as italianWords from 'italian-words';
import italianWordsDict from 'italian-words-dict';
import * as italianVerbs from 'italian-verbs';
import italianVerbsDict from 'italian-verbs-dict';
// es_ES
import * as spanishAdjectivesWrapper from 'spanish-adjectives-wrapper';
import * as spanishVerbsWrapper from 'spanish-verbs-wrapper';
import * as spanishWords from 'spanish-words';

import { parse, visit } from 'recast';

type Feature = 'verbs' | 'words' | 'adjectives';
type FeatureLang = {
  [key in Feature]: Languages[];
};

const features: FeatureLang = {
  verbs: ['en_US', 'fr_FR', 'de_DE', 'it_IT', 'es_ES'],
  /*
    for words:
      - 'en_US' is not meaningless for setRefGender, but useful for plurals, in value
      - thirdPossession is currently only supported in de_DE and fr_FR
  */
  words: ['en_US', 'de_DE', 'fr_FR', 'it_IT', 'es_ES'],
  adjectives: ['de_DE', 'it_IT', 'fr_FR', 'es_ES'],
};

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | 'es_ES' | string;
export type GendersMF = 'M' | 'F';

export type VerbData =
  | frenchVerbs.VerbInfo
  | germanVerbs.VerbInfo
  | italianVerbs.VerbInfo
  | englishVerbs.VerbInfo
  | spanishVerbsWrapper.VerbsInfo;
export interface VerbsData {
  [key: string]: VerbData;
}
export type WordData =
  | frenchWords.WordInfo
  | germanWords.WordInfo
  | italianWords.WordInfo
  | spanishWords.WordInfo
  | englishPlurals.WordInfo;
export interface WordsData {
  [key: string]: WordData;
}
export type AdjectiveData =
  | germanAdjectives.AdjectiveInfo
  | italianAdjectives.AdjectiveInfo
  | spanishAdjectivesWrapper.AdjectiveInfo
  | frenchAdjectivesWrapper.AdjectiveInfo;
export interface AdjectivesData {
  [key: string]: AdjectiveData;
}
export interface LinguisticResources {
  verbs: VerbsData;
  words: WordsData;
  adjectives: AdjectivesData;
}

function keyEqualsTo(prop: any, val: string): boolean {
  // when 'val':, is in value, when val:, is in name
  return prop.key.value === val || prop.key.name === val;
}

export class CodeGenHelper {
  private language: Languages;
  private embedResources: boolean;

  private verbCandidates: string[] = [];
  private wordCandidates: string[] = [];
  private adjectiveCandidates: string[] = [];

  private mergedVerbsDataEn: englishVerbs.VerbsInfo;

  private hasFeature(feature: Feature): boolean {
    return features[feature].indexOf(this.language) > -1;
  }

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
    this.language = language;
    this.embedResources = embedResources;

    // create English combined resource
    if (this.language === 'en_US') {
      this.mergedVerbsDataEn = englishVerbs.mergeVerbsData(englishVerbsIrregular, englishVerbsGerunds);
    }
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

    // so that they are available in the forEach
    const language = this.language;
    const mergedVerbsDataEn = this.mergedVerbsDataEn;
    this.verbCandidates.forEach(function (verbCandidate): void {
      try {
        switch (language) {
          case 'en_US': {
            const irregularVerbInfo = englishVerbs.getVerbInfo(mergedVerbsDataEn, verbCandidate);
            if (irregularVerbInfo) {
              res[verbCandidate] = irregularVerbInfo;
            }
            // else we don't care: regular verbs are ok
            break;
          }
          case 'fr_FR': {
            res[verbCandidate] = frenchVerbs.getVerbInfo(frenchVerbsDict as frenchVerbs.VerbsInfo, verbCandidate); //NOSONAR
            break;
          }
          case 'de_DE': {
            res[verbCandidate] = germanVerbs.getVerbInfo(germanVerbsDict as germanVerbs.VerbsInfo, verbCandidate); //NOSONAR
            break;
          }
          case 'it_IT': {
            res[verbCandidate] = italianVerbs.getVerbInfo(italianVerbsDict as italianVerbs.VerbsInfo, verbCandidate); //NOSONAR
            break;
          }
          case 'es_ES': {
            res[verbCandidate] = spanishVerbsWrapper.getVerbInfo(verbCandidate);
            break;
          }
        }
      } catch (e) {
        console.log(`Could not find any data for ${language} verb candidate ${verbCandidate}`);
      }
    });

    return res;
  }

  public getWordCandidatesData(): WordsData {
    const res: WordsData = {};
    const language = this.language;
    this.wordCandidates.forEach(function (wordCandidate): void {
      try {
        switch (language) {
          case 'en_US': {
            // we have more than just the irregular ones, but it's not a problem
            res[wordCandidate] = { plural: englishPlurals.getPlural(null, englishPluralsList, wordCandidate) };
            break;
          }
          case 'fr_FR': {
            res[wordCandidate] = frenchWords.getWordInfo(
              frenchWordsGenderLefff as frenchWords.GenderList, //NOSONAR
              wordCandidate,
            );
            break;
          }
          case 'de_DE': {
            res[wordCandidate] = germanWords.getWordInfo(germanWordsDict as germanWords.WordsInfo, wordCandidate); //NOSONAR
            break;
          }
          case 'it_IT': {
            res[wordCandidate] = italianWords.getWordInfo(italianWordsDict as italianWords.WordsInfo, wordCandidate); //NOSONAR
            break;
          }
          case 'es_ES': {
            res[wordCandidate] = spanishWords.getWordInfo(wordCandidate);
            break;
          }
        }
      } catch (e) {
        console.log(`Could not find any data for ${language} word candidate ${wordCandidate}`);
      }
    });

    return res;
  }

  public getAdjectiveCandidatesData(): AdjectivesData {
    const res: AdjectivesData = {};
    const language = this.language;
    this.adjectiveCandidates.forEach(function (adjectiveCandidate): void {
      try {
        switch (language) {
          case 'de_DE': {
            res[adjectiveCandidate] = germanAdjectives.getAdjectiveInfo(
              germanAdjectivesDict as germanAdjectives.AdjectivesInfo, //NOSONAR
              adjectiveCandidate,
            );
            break;
          }
          case 'it_IT': {
            res[adjectiveCandidate] = italianAdjectives.getAdjectiveInfo(
              italianAdjectivesDict as italianAdjectives.AdjectivesInfo, //NOSONAR
              adjectiveCandidate,
            );
            break;
          }
          case 'es_ES': {
            res[adjectiveCandidate] = spanishAdjectivesWrapper.getAdjectiveInfo(adjectiveCandidate);
            break;
          }
          case 'fr_FR': {
            res[adjectiveCandidate] = frenchAdjectivesWrapper.getAdjectiveInfo(adjectiveCandidate, null);
            break;
          }
        }
      } catch (e) {
        console.log(`Could not find any data for ${language} adjective candidate ${adjectiveCandidate}`);
      }
    });

    return res;
  }

  private extractHelper(args, extractor: Function, store: string[]): void {
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
    if (!this.embedResources || !this.hasFeature('verbs')) {
      return null;
    }

    // console.log(`extractVerbCandidate called on <${args}>`);

    const parsedExpr = this.getParsedExpr(args);
    this.checkAtLeastParams(parsedExpr, 2);

    const secondArg = parsedExpr[1];
    // console.log('secondArg: ' + JSON.stringify(secondArg));
    const isLitteralOrArray = (elt: any): boolean => elt.type === 'Literal' || elt.type === 'ArrayExpression';

    let found: any;
    if (isLitteralOrArray(secondArg)) {
      // string second arg form, or an array
      found = secondArg;
      //console.log(`found string second arg form: ${found}`);
    } else {
      // "verb:"" form
      visit(secondArg, {
        visitProperty: function (path) {
          if (keyEqualsTo(path.value, 'verb')) {
            if (isLitteralOrArray(path.value.value)) {
              found = path.value.value;
              // console.log(`found verb: form: ${found}`);
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
    if (!this.embedResources || !this.hasFeature('words')) {
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
    if (!this.embedResources || !this.hasFeature('words')) {
      return;
    }

    // console.log(`getWordCandidateFromSetRefGender called on <${args}>`);

    const parsedExpr = this.getParsedExpr(args);
    this.checkAtLeastParams(parsedExpr, 2);

    const val = this.getStringFromArg(parsedExpr[1]);

    if (val != null && val !== 'M' && val !== 'F' && val !== 'N') {
      return val;
    }
  }

  private getEltsFromEltOrListArg(arg: any): string[] {
    // console.log(`getEltsFromEltOrListArg: ${JSON.stringify(arg)}`);
    const res = [];

    if (!arg) {
      return [];
    }

    const isStringLiteral = (elt: any): boolean => elt.type === 'Literal' && typeof elt.value === 'string';

    if (isStringLiteral(arg)) {
      // one single adj
      res.push(arg.value);
    } else if (arg.type == 'ArrayExpression') {
      for (let i = 0; i < arg.elements.length; i++) {
        const elt = arg.elements[i];
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
    if (!this.embedResources || !this.hasFeature('adjectives')) {
      return;
    }

    // console.log(`getAdjCandidateFromSubjectVerbAdj called on <${args}>`);

    const parsedExpr = this.getParsedExpr(args);
    // there are always 3 args (S + V + A), sometimes 4 when extra params
    this.checkAtLeastParams(parsedExpr, 3);

    return this.getEltsFromEltOrListArg(parsedExpr[2]);
  }

  public extractAdjectiveCandidateFromAgreeAdj(args: string): void {
    this.extractHelper(args, this.getAdjectiveCandidateFromAgreeAdj, this.adjectiveCandidates);
  }
  public getAdjectiveCandidateFromAgreeAdj(args: string): string[] {
    if (!this.embedResources || !this.hasFeature('adjectives')) {
      return;
    }

    // console.log(`getAdjectiveCandidateFromAgreeAdj called on <${args}>`);

    const parsedExpr = this.getParsedExpr(args);

    // console.log('parsedExpr ' + parsedExpr);

    // there are always 2 args
    this.checkAtLeastParams(parsedExpr, 2);

    return this.getEltsFromEltOrListArg(parsedExpr[0]);
  }

  public extractAdjectiveCandidateFromValue(args: string): void {
    this.extractHelper(args, this.getAdjectiveCandidatesFromValue, this.adjectiveCandidates);
  }
  public getAdjectiveCandidatesFromValue(args: string): string[] {
    if (!this.embedResources || !this.hasFeature('adjectives')) {
      return [];
    }

    const res = [];
    //console.log(`getAdjectiveCandidatesFromValue called on <${args}>`);

    const parsedExpr = this.getParsedExpr(args);

    // form with 1 element is acceptable: we should not throw an exception
    this.checkAtLeastParams(parsedExpr, 1);

    // but we are only interested in the other arguments
    if (parsedExpr.length > 1) {
      const secondArg = parsedExpr[1];
      // console.log("secondArg: " + JSON.stringify(secondArg));

      function addArrayToRes(elts: any): void {
        for (let i = 0; i < elts.length; i++) {
          if (elts[i].type === 'Literal') {
            res.push(elts[i].value);
          }
        }
      }

      visit(secondArg, {
        visitProperty: function (path) {
          if (keyEqualsTo(path.value, 'adj')) {
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
                if (keyEqualsTo(prop, 'BEFORE') || keyEqualsTo(prop, 'AFTER')) {
                  addArrayToRes(prop.value.elements);
                }
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
    // console.log(`getWordCandidateFromThirdPossession called on <${args}>`);
    if (!this.embedResources || !this.hasFeature('words')) {
      return;
    }

    const res = [];

    // #[+thirdPossession(XXX, 'couleur')]
    // there can be 2 words

    const parsedExpr = this.getParsedExpr(args);
    // there must be 2 parameters
    this.checkAtLeastParams(parsedExpr, 2);

    // console.log(JSON.stringify(parsedExpr));

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
    // console.log(`arg: ${JSON.stringify(arg)}`);
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
    if (!this.embedResources || !this.hasFeature('words')) {
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

    return this.getEltsFromEltOrListArg(firstArg);
  }
}
