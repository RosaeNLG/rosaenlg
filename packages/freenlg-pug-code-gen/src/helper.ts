var frenchWordsGender = require('french-words-gender');
var germanWords = require('german-words');
var germanAdjectives = require('german-adjectives');
var frenchVerbs = require('french-verbs');
var germanVerbs = require('german-verbs');

import * as Debug from "debug";
const debug = Debug("freenlg-pug-code-gen");


const tousCaracteresMinMaj_re = "a-zaeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿA-ZAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ\-";

export class CodeGenHelper {

  language: 'fr_FR'|'de_DE'|'en_US';
  embedResources: boolean;

  verbCandidates: string[] = [];
  wordCandidates: string[] = [];
  adjectiveCandidates: string[] = [];

  constructor(language:'fr_FR'|'de_DE'|'en_US', embedResources:boolean) {
    this.language = language;
    this.embedResources = embedResources;
  }



  getAllLinguisticResources(explicitResources:any): any {
  
    // 1. init
    let allLinguisticResources = {
      verbs:{},
      words:{},
      adjectives:{},
    }

    // 2. get explicit resources, already solved
     allLinguisticResources = {
      ...allLinguisticResources,
      ...explicitResources};
  
  
    // 3. add found candidates
    if (this.verbCandidates!=null) {
      // console.log(verbCandidates);
      allLinguisticResources.verbs = {
        ...this.getVerbCandidatesData(), 
        ...allLinguisticResources.verbs};
    }
    if (this.wordCandidates!=null) {
      // console.log(wordCandidates);
      allLinguisticResources.words = {
        ...this.getWordCandidatesData(), 
        ...allLinguisticResources.words};
    }
    if (this.adjectiveCandidates!=null) {
      // console.log(wordCandidates);
      allLinguisticResources.adjectives = {
        ...this.getAdjectiveCandidatesData(),
        ...allLinguisticResources.adjectives};
    }
    
    return allLinguisticResources;
  }

  getVerbCandidatesData():any {
    let res:any = {};
    const language = this.language;
    this.verbCandidates.forEach(function(verbCandidate) {
      switch(language) {
        case 'fr_FR': {
          try {
            const verbData = frenchVerbs.getVerbData(verbCandidate);
            if (verbData!=null) {
              res[verbCandidate] = verbData;
            }
          } catch (e) {
              console.log(`Could not find any data for fr_FR verb candidate ${verbCandidate}`);  
          }
          break;
        }
        case 'de_DE': {
          try {
            const verbData = germanVerbs.getVerbData(verbCandidate);
            if (verbData!=null) {
              res[verbCandidate] = verbData;
            }
          } catch (e) {
            console.log(`Could not find any data for de_DE verb candidate ${verbCandidate}`);
          }
          break;
        }
      }
  
    });
  
    return res;
  }


  getWordCandidatesData(): any {
    let res:any = {};
    const language = this.language;
    this.wordCandidates.forEach(function(wordCandidate) {
      switch(language) {
        case 'fr_FR': {
          try {
            const wordData = frenchWordsGender.getGenderFrenchWord(wordCandidate, null);
            if (wordData!=null) {
              res[wordCandidate] = wordData;
            }
          } catch (e) {
            console.log(`Could not find any data for fr_FR word candidate ${wordCandidate}`);
          }
          break;
        }
        case 'de_DE': {
          try {
            const wordData = germanWords.getWordInfo(wordCandidate, null);
            if (wordData!=null) {
              res[wordCandidate] = wordData;
            }
          } catch (e) {
            console.log(`Could not find any data for de_DE word candidate ${wordCandidate}`);
          }
          break;
        }
      }
  
    });
  
    return res;
  }

  getAdjectiveCandidatesData():any {
    let res:any = {};
    const language = this.language;
    this.adjectiveCandidates.forEach(function(adjectiveCandidate) {
      switch(language) {
        case 'de_DE': {
          try {
            const adjData = germanAdjectives.getAdjectiveData(adjectiveCandidate, null);
            if (adjData!=null) {
              res[adjectiveCandidate] = adjData;
            }
          } catch (e) /* istanbul ignore next */ {
            console.log(`Could not find any data for de_DE adjective candidate ${adjectiveCandidate}`);
          }
          break;
        }
      }
  
    });
  
    return res;
  }



  extractVerbCandidate(args:string):void {
    if (!this.embedResources || (this.language!='fr_FR' && this.language!='de_DE')) {
      return;
    }

    //console.log(`extractVerbCandidate called on <${args}>`);

    // 1. try verb: form
    {
      const findVerb1stFormRe:RegExp = new RegExp(`verb['"]?\\s*:\\s*['"]([${tousCaracteresMinMaj_re}]+)['"]`);
      let extractRes:RegExpExecArray = findVerb1stFormRe.exec(args);
      if (extractRes!=null && extractRes.length>=2) {
        this.verbCandidates.push(extractRes[1]);
      }
    }
  
    // 2. try second arg
    {
      const splitArgs:string[] = args.split(',');
      if (splitArgs.length>=2) {
        const findVerb2ndFormRe:RegExp = new RegExp(`['"]([${tousCaracteresMinMaj_re}]+)['"]`);
        let extractRes2nd:RegExpExecArray = findVerb2ndFormRe.exec(args);
        if (extractRes2nd!=null && extractRes2nd.length>=2) {
          this.verbCandidates.push(extractRes2nd[1]);
        }
      }
    }
  
  }
  
  extractWordCandidateFromSetRefGender(args:string):void {
    if (!this.embedResources || (this.language!='fr_FR' && this.language!='de_DE')) {
      return;
    }

    // console.log(`extractWordCandidateFromSetRefGender called on <${args}>`);
  
    const findWordRe:RegExp = new RegExp(`['"]([${tousCaracteresMinMaj_re}]+)['"]`);
    let extractRes:RegExpExecArray = findWordRe.exec(args);
    if (extractRes!=null && extractRes.length>=2) {
      /*
        - setRefGender(PRODUKT2, 'Gurke');
        is ok, but avoid:
        - setRefGender(PRODUKT, 'N');
      */
      if (extractRes[1]!='M' && extractRes[1]!='F' && extractRes[1]!='N') {
        this.wordCandidates.push(extractRes[1]);
      }
    }
  
    return null;
  }
  
  extractAdjectiveCandidateFromAgreeAdj(args:string): void {
  
    if (!this.embedResources || this.language!='de_DE') {
      return;
    }

    //console.log(`extractAdjectiveCandidateFromAgreeAdj called on <${args}>`);
  
    const findAdjRe:RegExp = new RegExp(`^\\s*['"]([${tousCaracteresMinMaj_re}]+)['"]`);
    let extractRes:RegExpExecArray = findAdjRe.exec(args);
    if (extractRes!=null && extractRes.length>=2) {
      this.adjectiveCandidates.push(extractRes[1]);
    }
  
  }
  
  extractAdjectiveCandidateFromValue(args:string):void {
    if (!this.embedResources || this.language!='de_DE') {
      return;
    }

    //console.log(`extractAdjectiveCandidateFromValue called on <${args}>`);
  
    const findAdj:RegExp = new RegExp(`adj['"]?\\s*:\\s*['"]([${tousCaracteresMinMaj_re}]+)['"]`);
    let extractRes:RegExpExecArray = findAdj.exec(args);
    if (extractRes!=null && extractRes.length>=2) {
      this.adjectiveCandidates.push(extractRes[1]);
    }
  
    return null;
  }

  extractWordCandidateFromThirdPossession(args:string):void {   
    //console.log(`extractWordCandidateFromValue called on <${args}>`);
    if (!this.embedResources || (this.language!='fr_FR' && this.language!='de_DE')) {
      return;
    }

    // #[+thirdPossession(XXX, 'couleur')]
  
    const findWordRe:RegExp = new RegExp(`,\\s*['"]([${tousCaracteresMinMaj_re}]+)['"]`);
    let extractRes:RegExpExecArray = findWordRe.exec(args);
    if (extractRes!=null && extractRes.length>=2) {
      this.wordCandidates.push(extractRes[1]);
    }
  
  }

  extractWordCandidateFromValue(args:string):string {
    if (!this.embedResources || (this.language!='fr_FR' && this.language!='de_DE')) {
      return;
    }
  
    //console.log(`extractWordCandidateFromValue called on <${args}>`);
  
    if (args.indexOf('represents')==-1) {
      return null;
    }
  
    const findWordRe:RegExp = new RegExp(`\\s*['"]([${tousCaracteresMinMaj_re}]+)['"]`);
    let extractRes:RegExpExecArray = findWordRe.exec(args);
    if (extractRes!=null && extractRes.length>=2) {
      this.wordCandidates.push(extractRes[1]);
    }
  
    return null;
  }
  
}
