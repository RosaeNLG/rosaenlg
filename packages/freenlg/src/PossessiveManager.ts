import { GenderNumberManager } from "./GenderNumberManager";
import { RefsManager, NextRef } from "./RefsManager";
import { Helper } from "./Helper";
import { getCaseGermanWord } from "german-words";

import * as Debug from "debug";
const debug = Debug("freenlg");

export class PossessiveManager {
  language: string;
  genderNumberManager: GenderNumberManager;
  refsManager: RefsManager;
  helper: Helper;
  spy: Spy;

  constructor(params: any) {
    this.language = params.language;
    this.genderNumberManager = params.genderNumberManager;
    this.refsManager = params.refsManager;
    this.helper = params.helper;
  
  }

  /*
    still very partial
  */
  recipientPossession(owned: any): void {

    switch (this.language) {

      case 'en_US': {
        this.spy.appendPugHtml('your');
        this.spy.getPugMixins().value(owned, {_OWNER: true});
        break;
      }

      case 'fr_FR': {
        let nextRef: NextRef = this.refsManager.getNextRep(owned, {_OWNER: true});
        /* debug(`nextRef: 
                gender=${this.genderNumberManager.getRefGender(nextRef, null)} 
                number=${this.genderNumberManager.getRefNumber(nextRef, null)}`);
        */
        
        // vos / votre + value of the object
        this.spy.appendPugHtml( 
          `${this.helper.getSorP(['votre', 'vos'], nextRef)} `
        );
        this.spy.getPugMixins().value(owned, {_OWNER: true});
        break;
      }  
      case 'de_DE': {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = 'recipientPossession not implemented in de_DE';
        throw err;
      }
    }

  }

  private thirdPossession_refTriggered_fr_FR(owner: any, owned: any, params: any): void {
    let number: string = this.genderNumberManager.getRefNumber(owner, params);

    var det: string;
    if (number==null || number=='S') {
      det = this.helper.getMFN(['son','sa'], owned);
    } else if (number=='P') {
      det = 'leur';
    }
    this.spy.appendPugHtml(` ${det} ${owned} `);
  }

  private thirdPossession_refTriggered_en_US(owner: any, owned: any, params: any): void {
    let number: string = this.genderNumberManager.getRefNumber(owner, params);

    var det: string;
    if (number==null || number=='S') {
      det = this.helper.getMFN(['his','her','its'], owner);
    } else if (number=='P') {
      det = 'their';
    }
    this.spy.appendPugHtml(` ${det} ${owned} `);
  }

  private thirdPossession_triggerRef_fr_FR(owner: any, owned: any, params: any): void {
    this.spy.getPugMixins().value(owned, Object.assign({}, params, {det:'DEFINITE'}));
    this.spy.appendPugHtml(` de `);
    this.spy.getPugMixins().value(owner, Object.assign({}, params));
  }

  private thirdPossession_triggerRef_en_US(
    owner: any, 
    owned: any, 
    params: {
      possForm:'OF'|'S'
    }
    ): void {
    
    var possForm: 'OF'|'S';
    if (params!=null && params.possForm!=null) {
      if (params.possForm=='OF' || params.possForm=='S') {
        possForm = params.possForm;
      } else {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `possForm must be either OF or S`;
        throw err;
      }
    } else {
      possForm = 'OF';
    }

    if (possForm=='OF') {
      this.spy.getPugMixins().value(owned, Object.assign({}, params, {det:'DEFINITE'}));
      this.spy.appendPugHtml(` of `);
      this.spy.getPugMixins().value(owner, Object.assign({}, params));
    } else if (possForm=='S') {
      this.spy.getPugMixins().value(owner, Object.assign({}, params));
      this.spy.appendPugHtml(`'s`);
      this.spy.getPugMixins().value(owned, Object.assign({}, params));
    }
  }

  private thirdPossession_refTriggered_de_DE(owner: any, owned: any, params: any): void {
    const germanCase: string = params!=null && params.case!=null ? params.case : 'NOMINATIVE';
    if (germanCase!='NOMINATIVE' && germanCase!='GENITIVE') {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `${germanCase} is not a supported German case for possessives. Use NOMINATIVE or GENITIVE.`;
      throw err;
    }

    // debug(`${owner} ${owned}`);

    let genderOwner: string = this.genderNumberManager.getRefGender(owner, params);
    // debug(`owner: ${JSON.stringify(owner)} genderOwner: ${genderOwner}`);
    if (genderOwner==null) {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `the owner ${JSON.stringify(owner)} has no clear gender`;
      throw err;
    }
    
    const casePossessiveMap: any = {
      'NOMINATIVE': {
        'M': ['sein', 'seine', 'sein'],
        'F': ['ihr', 'ihre', 'ihr'],
        'N': ['sein', 'seine', 'sein']
      },
      'GENITIVE': {
        'M': ['seines', 'seiner', 'seines'],
        'F': ['ihres', 'ihrer', 'ihres'],
        'N': ['seines', 'seiner', 'seines']
      }
    };
    /*
      1. suivant le genre du possesseur :
        M ou N => sein
        F => ihr
      2. se déclinent et s'accordent en genre, en nombre et en cas avec le substantif auquel ils se rapportent
        NOMINATIF :
          sein seine sein
          ihr ihre ihr
        GENITIF :
          seines seiner seines
          ihres ihrer ihres
    */
    // debug(`${germanCase} ${genderOwner}`);
    let det: string = this.helper.getMFN( casePossessiveMap[germanCase][genderOwner], owned);
    
    /*
      3. décliner le mot
      getCaseGermanWord always returns something (not null)
      TODO manage plurals
    */
    let declinedWord: string = getCaseGermanWord(owned, germanCase, 'S');

    this.spy.appendPugHtml(` ${det} ${declinedWord} `);

  }

  private thirdPossession_triggerRef_de_DE(owner: any, owned: any, params: any): void {
    this.spy.getPugMixins().value(owned, Object.assign({}, params, {det:'DEFINITE'}));
    this.spy.appendDoubleSpace();
    this.spy.getPugMixins().value(owner, Object.assign({}, params, {case: 'GENITIVE'}));
  }

  /* 
    a lot of stuff is missing here
  */
  thirdPossession(owner: any, owned: any, params: any): void {
    this.spy.appendDoubleSpace();

    // on a besoin de savoir si ça va être ref ou ana, mais aussi le genre, le nombre...
    let nextRef: NextRef = this.refsManager.getNextRep(owner, params);

    /* debug(`nextRef: 
            gender=${this.genderNumberManager.getRefGender(nextRef, null)} 
            number=${this.genderNumberManager.getRefNumber(nextRef, null)}
            REPRESENTANT=${nextRef.REPRESENTANT}`);
    */

    /* istanbul ignore if */
    if (nextRef.REPRESENTANT!='ref' && nextRef.REPRESENTANT!='refexpr') {
      var err = new Error();
      err.name = '';
      err.message = `internal pb on thirdPossession: ${JSON.stringify(nextRef)}`;
      throw err;
    }

    if (nextRef.REPRESENTANT=='ref') {

      // ref not triggered, thus we will have to do it
      switch (this.language) {
        case 'en_US':
          this.thirdPossession_triggerRef_en_US(owner, owned, params);
          break;
        case 'fr_FR':
          this.thirdPossession_triggerRef_fr_FR(owner, owned, params);
          break;
        case 'de_DE':
          this.thirdPossession_triggerRef_de_DE(owner, owned, params);
          break;
      }
    
    } else if (nextRef.REPRESENTANT=='refexpr') {

      // ref was already triggered, we only have to manage the possessive
      switch (this.language) {
        /* istanbul ignore next */
        case 'en_US':
          this.thirdPossession_refTriggered_en_US(owner, owned, params);
          break;
        case 'fr_FR':
          this.thirdPossession_refTriggered_fr_FR(owner, owned, params);
          break;
        case 'de_DE':
          this.thirdPossession_refTriggered_de_DE(owner, owned, params);
          break;
      }

    }

    this.spy.appendDoubleSpace();  
  }

}

