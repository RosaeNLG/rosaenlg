// en_US
import englishVerbsIrregular from 'english-verbs-irregular';
import englishVerbsGerunds from 'english-verbs-gerunds';
import * as englishVerbs from 'english-verbs-helper';
// fr_fr
import * as frenchWordsGender from 'french-words-gender';
import frenchWordsGenderLefff from 'french-words-gender-lefff';
import * as frenchVerbs from 'french-verbs';
import frenchVerbsDict from 'french-verbs-lefff';
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

import { parse, visit } from 'recast';

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | string;
export type GendersMF = 'M' | 'F';

export type VerbData = frenchVerbs.VerbInfo | germanVerbs.VerbInfo | italianVerbs.VerbInfo | englishVerbs.VerbInfo;
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
    this.verbCandidates.forEach(function(verbCandidate): void {
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
          try {
            res[verbCandidate] = frenchVerbs.getVerbInfo(frenchVerbsDict as frenchVerbs.VerbsInfo, verbCandidate);
          } catch (e) {
            console.log(`Could not find any data for fr_FR verb candidate ${verbCandidate}`);
          }
          break;
        }
        case 'de_DE': {
          try {
            res[verbCandidate] = germanVerbs.getVerbInfo(germanVerbsDict as germanVerbs.VerbsInfo, verbCandidate);
          } catch (e) {
            console.log(`Could not find any data for de_DE verb candidate ${verbCandidate}`);
          }
          break;
        }
        case 'it_IT': {
          try {
            res[verbCandidate] = italianVerbs.getVerbInfo(italianVerbsDict as italianVerbs.VerbsInfo, verbCandidate);
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
            res[wordCandidate] = frenchWordsGender.getGenderFrenchWord(
              frenchWordsGenderLefff as frenchWordsGender.WordsWithGender,
              wordCandidate,
            );
          } catch (e) {
            console.log(`Could not find any data for fr_FR word candidate ${wordCandidate}`);
          }
          break;
        }
        case 'de_DE': {
          try {
            res[wordCandidate] = germanWords.getWordInfo(germanWordsDict as germanWords.WordsInfo, wordCandidate);
          } catch (e) {
            console.log(`Could not find any data for de_DE word candidate ${wordCandidate}`);
          }
          break;
        }
        case 'it_IT': {
          try {
            res[wordCandidate] = italianWords.getWordInfo(italianWordsDict as italianWords.WordsInfo, wordCandidate);
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
            const adjData = germanAdjectives.getAdjectiveInfo(
              germanAdjectivesDict as germanAdjectives.AdjectivesInfo,
              adjectiveCandidate,
            );
            res[adjectiveCandidate] = adjData;
          } catch (e) /* istanbul ignore next */ {
            console.log(`Could not find any data for de_DE adjective candidate ${adjectiveCandidate}`);
          }
          break;
        }
        case 'it_IT': {
          try {
            const adjData = italianAdjectives.getAdjectiveInfo(
              italianAdjectivesDict as italianAdjectives.AdjectivesInfo,
              adjectiveCandidate,
            );
            res[adjectiveCandidate] = adjData;
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
    const languagesWithVerbsToExtract = ['en_US', 'fr_FR', 'de_DE', 'it_IT'];
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
        visit(secondArg, {
          visitProperty: function(path) {
            if (keyEqualsTo(path.value, 'verb')) {
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

      visit(secondArg, {
        visitProperty: function(path) {
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
