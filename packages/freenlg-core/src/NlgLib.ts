import { ValueManager } from "./ValueManager";
import { SynManager } from "./SynManager";
import { VerbsManager } from "./VerbsManager";
import { RefsManager } from "./RefsManager";
import { FilterManager, steps } from "./FilterManager";
import { AdjectiveManager } from "./AdjectiveManager";
import { AsmManager } from "./AsmManager";
import { Helper } from "./Helper";
import { SubstantiveManager } from "./SubstantiveManager";
import { PossessiveManager } from "./PossessiveManager";
import { SaveRollbackManager } from "./SaveRollbackManager";
import { RandomManager } from "./RandomManager";
import { LefffHelper } from "lefff-helper";
import { GermanDictHelper } from "./GermanDictHelper";

import * as compromise from "compromise";
import * as moment from 'moment';
import * as numeral from 'numeral';
import { GenderNumberManager } from "./GenderNumberManager";
import { SaidManager } from "./SaidManager";
import { throwStatement } from "babel-types";

export class NlgLib {

  isEvaluatingEmpty: boolean;
  isEvaluatingNextRep: boolean;

  valueManager: ValueManager;
  synManager: SynManager;
  verbsManager: VerbsManager;
  refsManager: RefsManager;
  filterManager: FilterManager;
  adjectiveManager: AdjectiveManager;
  asmManager: AsmManager;
  helper: Helper;
  substantiveManager: SubstantiveManager;
  possessiveManager: PossessiveManager;
  saveRollbackManager: SaveRollbackManager;
  randomManager: RandomManager;
  genderNumberManager: GenderNumberManager;
  saidManager: SaidManager;

  dictHelper: LefffHelper | GermanDictHelper;

  spy: Spy;
  randomSeed: number;
  language: string;
  disableFiltering: boolean;
  compromise: any;
  moment: any;
  numeral: any;

  // todo improve
  filterManagerSteps: any;

  constructor(params: any) {

    const supportedLanguages: Array<string> = ['fr_FR', 'en_US', 'de_DE'];
  
    this.randomSeed = (params!=null && params.forceRandomSeed!=null) ? params.forceRandomSeed : Math.floor(Math.random() * 1000);
    //console.log("seed: " + this.randomSeed);
    this.randomManager = new RandomManager(this.randomSeed);
  
    this.language = params!=null ? params.language : null;
    this.disableFiltering = params!=null ? params.disableFiltering : null;
    if (supportedLanguages.indexOf(this.language)==-1) {
      console.log('ERROR: provided language is ' + this.language + ' while supported languages are ' + supportedLanguages.join(' '));
    }
  
    {
      // referencing compromise for custom user usage
      if (this.language=='en_US') {
        // console.log('USING compromise lib');
        this.compromise = compromise;
      } else if (this.language=='fr_FR') {
    
      }
      
      // same for moment
      this.moment = moment;

      // same for numeral
      this.numeral = numeral;
    }
  
    this.saveRollbackManager = new SaveRollbackManager(this);
  
    this.genderNumberManager = new GenderNumberManager({
      language: this.language
    });
    this.helper = new Helper({
      genderNumberManager: this.genderNumberManager
    });
    this.verbsManager = new VerbsManager({
      language: this.language,
      genderNumberManager: this.genderNumberManager
    });
    this.synManager = new SynManager({
      randomManager: this.randomManager,
      defaultSynoMode: params.defaultSynoMode || 'random',
      saveRollbackManager: this.saveRollbackManager,
    });
    this.asmManager = new AsmManager({
      randomManager: this.randomManager,
      saveRollbackManager: this.saveRollbackManager
    });
    this.filterManager = new FilterManager({language: this.language, disableFiltering: this.disableFiltering});
    this.saidManager = new SaidManager();
    this.refsManager = new RefsManager({
      saveRollbackManager: this.saveRollbackManager,
      genderNumberManager: this.genderNumberManager,
      randomManager: this.randomManager
    });
    this.adjectiveManager = new AdjectiveManager({
      language: this.language,
      genderNumberManager: this.genderNumberManager
    });
    this.substantiveManager = new SubstantiveManager({
      language: this.language,
      genderNumberManager: this.genderNumberManager
    });
    this.possessiveManager = new PossessiveManager({
      language: this.language,
      genderNumberManager: this.genderNumberManager,
      refsManager: this.refsManager,
      helper: this.helper
    });
        
    switch (this.language) {
      case 'fr_FR':
        this.dictHelper = new LefffHelper();
        break;
      case 'de_DE':
      this.dictHelper = new GermanDictHelper();
      break;
    case 'en_US':
        // nothing
    }

    this.valueManager = new ValueManager({
      language: this.language,
      refsManager: this.refsManager,
      helper: this.helper,
      randomManager: this.randomManager,
      genderNumberManager: this.genderNumberManager,
      adjectiveManager: this.adjectiveManager,
      substantiveManager: this.substantiveManager,
      possessiveManager: this.possessiveManager,
      dictHelper: this.dictHelper
    });
  
    this.saveRollbackManager.bindObjects({
      saidManager: this.saidManager,
      refsManager: this.refsManager,
      genderNumberManager: this.genderNumberManager,
      randomManager: this.randomManager,
      synManager: this.synManager
    });
  
    this.filterManagerSteps = steps;
  
  }

  setSpy(spy: Spy): void {
    this.spy = spy;
  
    // transfer knowledge
    this.valueManager.spy = spy;
    this.synManager.spy = spy;
    this.verbsManager.spy = spy;
    this.refsManager.spy = spy;
    this.filterManager.spy = spy;
    this.adjectiveManager.spy = spy;
    this.asmManager.spy = spy;
    this.helper.spy = spy;
    this.substantiveManager.spy = spy;
    this.possessiveManager.spy = spy;
    this.saveRollbackManager.spy = spy;
  };

}

