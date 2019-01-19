import { RefsManager } from "./RefsManager";
import { RandomManager } from "./RandomManager";
import { AdjectiveManager } from "./AdjectiveManager";
import { SubstantiveManager } from "./SubstantiveManager";
import { Helper } from "./Helper";
import { GenderNumberManager } from "./GenderNumberManager";
import { GermanOrdinals } from "./ValueManagerGermanOrdinals";
import { FrenchOrdinals } from "./ValueManagerFrenchOrdinals";
import { getDet } from "./Determinant";
import { getCaseGermanWord } from "./GermanWordsGenderCases";
import  { isHMuet } from "./FrenchHAspire";
import { PossessiveManager } from "./PossessiveManager"



import { LefffHelper } from "C:\\FreeNLG\\french-tagger\\dist\\lefffhelper.js"
import { parse } from "C:\\FreeNLG\\french-tagger\\french-grammar.js"



import * as compromise from "compromise";

import * as writtenNumber from "written-number";
import * as writeInt from "write-int";
import * as numeral from "numeral";
import 'numeral/locales/de';
import 'numeral/locales/fr';

import * as moment from 'moment';

export class ValueManager {
  language: string;
  refsManager: RefsManager;
  genderNumberManager: GenderNumberManager;
  randomManager: RandomManager;
  adjectiveManager: AdjectiveManager;
  substantiveManager: SubstantiveManager;
  helper: Helper;
  spy: Spy;
  germanOrdinals: GermanOrdinals;
  frenchOrdinals: FrenchOrdinals;
  possessiveManager: PossessiveManager;
  simplifiedStringsCache: any[] = [];

  constructor(params: any) {
    this.language = params.language;
    this.refsManager = params.refsManager;
    this.genderNumberManager = params.genderNumberManager;
    this.randomManager = params.randomManager;
    this.adjectiveManager = params.adjectiveManager;
    this.substantiveManager = params.substantiveManager;
    this.helper = params.helper;
    this.possessiveManager = params.possessiveManager;

    this.germanOrdinals = new GermanOrdinals;
    this.frenchOrdinals = new FrenchOrdinals;
  }

  value(obj: any, params: any): void {

    // no first obj, but a single params objet than contains everything
    if (obj!=null && obj.elt!=null) {
      var newParams:any = Object.assign({}, obj);
      newParams.elt = null;
      this.value(obj.elt, newParams);
      return;
    }


    if (params!=null && params.owner!=null) {
      var newParams = Object.assign({}, params);
      newParams.owner = null; // to avoid looping: we already take into account that param
      this.possessiveManager.thirdPossession(params.owner, obj, newParams);
      return;
    }

    if (typeof(obj) === 'number') {
      this.spy.appendPugHtml( this.valueNumber(obj, params) );
    } else if (typeof(obj) === 'string') {

      if (obj.charAt(0)=='<' && obj.charAt(obj.length-1)=='>') {
        // does the append by itself
        this.valueSimplifiedString(obj.substring(1, obj.length-1), params);
        
      } else {
        this.spy.appendPugHtml( this.valueString(obj, params) );
      }

    } else if (obj instanceof Date) {
      this.spy.appendPugHtml( this.valueDate(obj, params) );
    } else if ( obj.isAnonymous ) {
      // do nothing
    } else if (typeof(obj) === 'object') {
      // it calls mixins, it already appends
      this.valueObject(obj, params);
    } else {
      console.log('ERROR: value not possible on: ' + JSON.stringify(obj));
    }

    if (params!=null && params.represents!=null) {
      this.genderNumberManager.setRefGender(params.represents, obj, params);
    }

  }
  
  valueDate(val: Date, params: any): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_DATE';
    } else {
      var localLocale = moment(val);
      localLocale.locale( this.language.replace('_','-') );
      return this.helper.protectString( localLocale.format(params) );
    }
  }
  
  valueSimplifiedString(val: string, params: any): void {
    if (this.spy.isEvaluatingEmpty()) {
      this.spy.appendPugHtml('SOME_STRING');
      return;
    }

    if (this.language!='fr_FR') {
      console.log('ERROR <...> syntax only works in French!');
      return;
    }

    var solved:any;

    solved = this.simplifiedStringsCache[val];
    if (solved==null) {

      // le récupérer plus globalement
      let lh: LefffHelper = new LefffHelper();

      // console.log(`BEFORE: #${val}#`);

      solved = parse(val, {
        lefffhelper: lh
      });
      console.log(solved);

      solved.elt = solved.noun;
      solved.noun = null;

      this.simplifiedStringsCache[val] = solved;
    } else {
      // console.log(`using cache for ${val}`);
    }
    
    this.value(solved, null);

  }

  valueString(val: string, params: any): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_STRING';
    }

    // console.log(`here for ${val} with params: ${JSON.stringify(params)}`);

    // det only accepted when string
    var det = '';
    if (params!=null && params.det!=null) {
      det = getDet(this.language, params.det, val, params); // can return ''
    }

    var adj = '';
    if (params!=null && params.adj!=null) {
      adj = this.adjectiveManager.getAgreeAdj(params.adj, val, params);
    }

    var valContent:string;
    switch (this.language) {
      case 'en_US':
        valContent = val;
        break;
      case 'de_DE':
        if (params!=null && params.case!=null) {
          valContent = getCaseGermanWord(val, params.case);
        } else {
          valContent = val;
        }
        break;
      case 'fr_FR':
        if (params!=null && params.number=='P') {
          valContent = this.substantiveManager.getSubstantive(val, this.genderNumberManager.getAnonMP());
        } else {
          valContent = val;
        }
        break;      
    }
    

    switch (this.language) {
      case 'en_US':
        return `${det} ${adj} ${valContent}`;
      case 'de_DE':
        return `${det} ${adj} ${valContent}`;
      case 'fr_FR':
        let adjPos: string;
        if (params!=null && params.adjPos!=null) { 
          adjPos = params.adjPos;
        } else {
          // In general, and unlike English, French adjectives are placed after the noun they describe
          adjPos = 'AFTER';
        }

        if (adjPos!='AFTER' && adjPos!='BEFORE' ) {
          console.log(`ERROR adjPos must be AFTER or BEFORE!`);
          adjPos = 'AFTER';
        }

        if (adjPos=='AFTER') {
          return `${det} ${valContent} ${adj}`;
        } else {
          const adjChangeants = {
            'vieux': 'vieil',
            'beau': 'bel',
            'nouveau': 'nouvel',
            'mou': 'mol',
            'fou': 'fol'
          }

          if ( adjChangeants[adj]!=null ) {
              const voyelles: string = 'aeiouyàáâãäåèéêëìíîïòóôõöøùúûüÿAEIOUYÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖØÙÚÛÜŸ'; // toutesVoyellesMinMaj
              if (    voyelles.indexOf(valContent.charAt(0))>-1 // commençant par une voyelle
                  || ( valContent.charAt(0)=='h' && isHMuet(valContent) ) // h muet
              ) {
                // console.log(`${adj} suivi de ${valContent}, on le change`);
                adj = adjChangeants[adj];
              }
            }
        
          return `${det} ${adj} ${valContent}`;
        }
        
    }

  }
  
  valueObject(obj: any, params: any): void {
    // console.log(obj);
    
    //- we already have the next one
    if (this.refsManager.getNextRef(obj)!=null) {
      //console.log('we already have the next one');
      this.randomManager.rndNextPos = this.refsManager.getNextRef(obj).rndNextPos;
      this.refsManager.deleteNextRef(obj);
    }
  
    if ( this.helper.getFlagValue(params, 'REPRESENTANT')=='ref' ) {
      this.valueRef(obj, params);
    } else if ( this.helper.getFlagValue(params, 'REPRESENTANT')=='refexpr' ) {
      this.valueRefexpr(obj, params);
    } else
      if ( !this.refsManager.hasTriggeredRef(obj) ) {
        this.valueRef(obj, params);
      } else if (obj.refexpr) {
        this.valueRefexpr(obj, params);
      } else {
        //- we trigger ref if obj has no refexpr
        this.valueRef(obj, params);
      }
  }
  
  
  valueRefexpr(obj: any, params: any): void {
    // console.log('refexpr: ' + JSON.stringify(params));
    if (obj.refexpr) {
      this.spy.getPugMixins()[obj.refexpr](obj, params);
    } else {
      console.log('ERROR: ' + obj + ' has no refexpr mixin');
      this.spy.getPugMixins().insertVal(obj.toString());
    }
  }
  
  
  valueRef(obj: any, params: any): void {
    //- printObj('value_ref', obj)
    if (obj.ref) {
      // console.log('value_ref_ok: ' + obj.ref);
      this.spy.getPugMixins()[obj.ref](obj, params);
      this.refsManager.setTriggeredRef(obj);
    } else {
      console.log('ERROR: ' + JSON.stringify(obj) + ' has no ref mixin');
      this.spy.getPugMixins().insertVal(obj.toString());
    }
  }
  
  
  valueNumber(val: number, params: any): string {
    const langForNumeral: string = this.language.split('_')[0];
  
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_NUMBER';
    } else {
      if (this.helper.hasFlag(params, 'AS_IS')) {
        return val.toString();
      } else if ( this.helper.getFlagValue(params, 'FORMAT')!=null ) {
        var format:string = this.helper.getFlagValue(params, 'FORMAT');
        numeral.locale(langForNumeral);
        return this.helper.protectString( numeral(val).format( format ) );
      } else if (this.helper.hasFlag(params, 'TEXTUAL')) {
        switch (this.language) {
          case 'en_US':
            return compromise(val).values().toText().all().out();
          case 'fr_FR':
            return writtenNumber(val, {lang: 'fr'});
          case 'de_DE':
            // unfortunately written-number does not support German, while write-int does not support French
            return writeInt(val, {lang: 'de'});
        }
      } else if (this.helper.hasFlag(params, 'ORDINAL_NUMBER')) {
        // tested for en_US fr_FR de_DE
        numeral.locale(langForNumeral);
        return this.helper.protectString( numeral(val).format('o') );
      } else if (this.helper.hasFlag(params, 'ORDINAL_TEXTUAL')) {
        switch (this.language) {
          case 'en_US':
            return compromise(val).values().toText().all().values().toOrdinal().all().out();
          case 'fr_FR':
            return this.frenchOrdinals.getOrdinal(val);
          case 'de_DE':
            return this.germanOrdinals.getOrdinal(val);
          }
      } else {
        // tested for en_US fr_FR de_DE
        numeral.locale(langForNumeral);
        return this.helper.protectString( numeral(val).format('0,0.[000000000000]') );
      }
    }
  }
  
}

