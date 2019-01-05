import { RefsManager } from "./RefsManager";
import { RandomManager } from "./RandomManager";
import { Helper } from "./Helper";
import { GenderNumberManager } from "./GenderNumberManager";
import { GermanOrdinals } from "./ValueManagerGermanOrdinals";
import { FrenchOrdinals } from "./ValueManagerFrenchOrdinals";
import { getDet } from "./Determinant";

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
  helper: Helper;
  spy: Spy;
  germanOrdinals: GermanOrdinals;
  frenchOrdinals: FrenchOrdinals;

  constructor(params: any) {
    this.language = params.language;
    this.refsManager = params.refsManager;
    this.genderNumberManager = params.genderNumberManager;
    this.randomManager = params.randomManager;
    this.helper = params.helper;

    this.germanOrdinals = new GermanOrdinals;
    this.frenchOrdinals = new FrenchOrdinals;
  }

  value(obj: any, params: any): void {

    if (typeof(obj) === 'number') {
      this.spy.appendPugHtml( this.valueNumber(obj, params) );
    } else if (typeof(obj) === 'string') {
      // det only accepted when string
      if (params!=null && params.det!=null) {
        this.spy.appendPugHtml( getDet(this.language, params.det, obj as string, params) );
      }

      this.spy.appendPugHtml( this.valueString(obj, params) );    
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
      this.genderNumberManager.setRefGender(params.represents, obj);
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
  
  valueString(val: string, params: any): string {
    return this.spy.isEvaluatingEmpty() ? 'SOME_STRING' : val;
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

