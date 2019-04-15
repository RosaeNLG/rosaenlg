import { GenderNumberManager } from "./GenderNumberManager";
import { getConjugation as lib_getConjugation_fr_FR } from "french-verbs";
import { getConjugation as lib_getConjugation_de_DE } from "german-verbs";

import * as compromise from "compromise";

import * as Debug from "debug";
const debug = Debug("freenlg");

export class VerbsManager {
  language: string;
  genderNumberManager: GenderNumberManager;
  spy: Spy;
  embeddedVerbs:any;

  verb_parts: string[];

  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;
    this.verb_parts = [];
  }
  

  getAgreeVerb(subject: any, verbInfo: string | any): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_VERB';
    } else {
  
      const verbName: string = typeof verbInfo === 'string' ? verbInfo : verbInfo.verb;
      if (verbName==null) { 
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `verb needed`;
        throw err;  
      }

      var tense:string;
      if (verbInfo!=null && verbInfo.tense!=null) {
        tense = verbInfo.tense;
      } else {
        const defaultTenses = {
          'en_US': 'PRESENT',
          'fr_FR': 'PRESENT',
          'de_DE': 'PRASENS',
        }
        tense = defaultTenses[this.language];
      }

      const number:'S'|'P' = this.genderNumberManager.getRefNumber(subject, null);

      // debug('verb=' + verbName + ' tense=' + tense + ' params: ' + JSON.stringify(verbInfo));

      const leftParams = typeof verbInfo === 'string' ? null : verbInfo;
      switch (this.language) {
        case 'en_US':
          return this.getConjugation_en_US(verbName, tense, number);
        case 'fr_FR':
          return this.getConjugation_fr_FR(verbName, tense, number, leftParams);
        case 'de_DE':
        return this.getConjugation_de_DE(verbName, tense, number, leftParams);
      }
    
    }
  }

  popVerbPart():string {
    if (this.language!='de_DE') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart is only meaningful for de_DE language, not for ${this.language}`;
      throw err;
    }

    const verb:string = this.verb_parts.pop();
    if (!verb) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart nothing to pop`;
      throw err;
    }
    return verb;
  }
  
  private getConjugation_de_DE(verb: string, tense: string, number: 'S'|'P', verbInfo: any): string {
    const tensesWithParts:string[] = ['FUTUR1','FUTUR2', 'PERFEKT',
                                      'PLUSQUAMPERFEKT', 'KONJUNKTIV1_FUTUR1', 'KONJUNKTIV1_PERFEKT',
                                      'KONJUNKTIV2_FUTUR1', 'KONJUNKTIV2_FUTUR2'];


    let pronominal:boolean = false;
    let pronominalCase:'ACC'|'DAT';
    if (verbInfo!=null && verbInfo.pronominal==true) {
      pronominal = true;
      pronominalCase = verbInfo.pronominalCase;
    }
                                                                        
    if ( tensesWithParts.indexOf(tense)>-1) {
      // 'wird sein'

      // istanbul ignore next
      const aux:'SEIN'|'HABEN' = verbInfo!=null ? verbInfo.aux : null;
      const conjElts:string[] = lib_getConjugation_de_DE(
          verb, tense as any, 
          3, number, aux, 
          pronominal, pronominalCase,
          this.embeddedVerbs);
      this.verb_parts.push(conjElts.slice(1).join(' ')); // FUTUR2: 'wird gedacht haben'
      return conjElts[0];
    
    } else {
      return lib_getConjugation_de_DE(
        verb, <'PRASENS'|'PRATERITUM'|'KONJUNKTIV1_PRASENS'|'KONJUNKTIV2_PRATERITUM'>tense, 
        3, number, null,
        pronominal, pronominalCase,
        this.embeddedVerbs).join(' ');
    }
  }
  
  private getConjugation_fr_FR(verb: string, tense: string, number: 'S'|'P', verbInfo: any): string {
    let person;
    if (number=='P') {
      person = 5;
    } else {
      person = 2;
    }

    var params:any = {};
    if (verbInfo!=null && verbInfo.pronominal==true) {
      params.pronominal = true;
    }
    if (verbInfo!=null && verbInfo.aux!=null) {
      params.aux = verbInfo.aux;
    }
    if (verbInfo!=null && verbInfo.agree!=null) {
      params.agreeGender = this.genderNumberManager.getRefGender(verbInfo.agree, null);
      params.agreeNumber = this.genderNumberManager.getRefNumber(verbInfo.agree, null);
    }
    params.tense = tense;
    params.verb = verb;
    params.person = person;

    // also give the verbs that we embedded in the compiled template, if there are some
    params.verbsSpecificList = this.embeddedVerbs;
    //console.log(`verbsSpecificList: ${JSON.stringify(params.verbsSpecificList)}`);

    return lib_getConjugation_fr_FR(params);
      
  }
  
  
  private getConjugation_en_US(verb: string, tense: string, number:'S'|'P'): string {
    // debug( compromise(verb).verbs().conjugate() );
    // debug('TENSE: ' + tense);
    switch(tense) {
      case 'PRESENT':
        if (number=='P') return verb;
        return compromise(verb).verbs().toPresentTense().all().out();
      case 'PAST':
        return compromise(verb).verbs().toPastTense().all().out();
      case 'FUTURE':
        return compromise(verb).verbs().toFutureTense().all().out();
    }
  }
    
  
}


