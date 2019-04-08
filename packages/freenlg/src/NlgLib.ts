import { ValueManager } from "./ValueManager";
import { SynManager } from "./SynManager";
import { ChoosebestManager } from "./ChoosebestManager";
import { VerbsManager } from "./VerbsManager";
import { RefsManager } from "./RefsManager";
import { filter } from "freenlg-filter";
import { AdjectiveManager } from "./AdjectiveManager";
import { AsmManager } from "./AsmManager";
import { Helper } from "./Helper";
import { SubstantiveManager } from "./SubstantiveManager";
import { PossessiveManager } from "./PossessiveManager";
import { NominalGroupManager } from "./NominalGroupManager";
import { SaveRollbackManager } from "./SaveRollbackManager";
import { RandomManager } from "./RandomManager";
import { LefffHelper } from "lefff-helper";
import { GermanDictHelper } from "german-dict-helper";

import * as compromise from "compromise";
import * as moment from 'moment';
import * as numeral from 'numeral';
import { GenderNumberManager } from "./GenderNumberManager";
import { SaidManager } from "./SaidManager";

import * as Debug from "debug";
const debug = Debug("freenlg");

export class NlgLib {

  valueManager: ValueManager;
  synManager: SynManager;
  choosebestManager: ChoosebestManager;
  verbsManager: VerbsManager;
  refsManager: RefsManager;
  adjectiveManager: AdjectiveManager;
  asmManager: AsmManager;
  helper: Helper;
  substantiveManager: SubstantiveManager;
  possessiveManager: PossessiveManager;
  saveRollbackManager: SaveRollbackManager;
  randomManager: RandomManager;
  genderNumberManager: GenderNumberManager;
  saidManager: SaidManager;
  nominalGroupManager: NominalGroupManager;

  dictHelper: LefffHelper | GermanDictHelper;

  spy: Spy;
  randomSeed: number;
  language: string;
  disableFiltering: boolean;
  compromise: any;
  moment: any;
  numeral: any;

  hasFilteredInMixin: boolean = false;

  // to be called in filter mixin
  filterFct: any = filter;

  constructor(params: any) {

    const supportedLanguages: Array<string> = ['fr_FR', 'en_US', 'de_DE'];
  
    this.randomSeed = (params!=null && params.forceRandomSeed!=null) ? params.forceRandomSeed : Math.floor(Math.random() * 1000);
    // debug("seed: " + this.randomSeed);
    this.randomManager = new RandomManager(this.randomSeed);

    if (params!=null && params.language!=null) {
      this.language = params.language;
      if (supportedLanguages.indexOf(this.language)==-1) {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `provided language is ${this.language} while supported languages are ${supportedLanguages.join()}`;
        throw err;
      }
    } else {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `must provide a language`;
      throw err;
    }

    if (params!=null && params.disableFiltering==true) {
      this.disableFiltering = true;  
    }
  
    {
      // referencing compromise for custom user usage
      if (this.language=='en_US') {
        // debug('USING compromise lib');
        this.compromise = compromise;
      } else if (this.language=='fr_FR') {
    
      }
      
      // same for moment
      this.moment = moment;

      // same for numeral
      this.numeral = numeral;
    }
  
    this.saveRollbackManager = new SaveRollbackManager();
  
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

    this.choosebestManager = new ChoosebestManager({
      language: this.language,
      defaultAmong: params.defaultAmong || 5,
      randomManager: this.randomManager,
      saveRollbackManager: this.saveRollbackManager,
    })

    this.asmManager = new AsmManager({
      randomManager: this.randomManager,
      saveRollbackManager: this.saveRollbackManager
    });
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

    this.nominalGroupManager = new NominalGroupManager({
      verbsManager: this.verbsManager,
      language: this.language,
      valueManager: this.valueManager,
      adjectiveManager: this.adjectiveManager
    })
  
    this.saveRollbackManager.bindObjects({
      saidManager: this.saidManager,
      refsManager: this.refsManager,
      genderNumberManager: this.genderNumberManager,
      randomManager: this.randomManager,
      synManager: this.synManager,
      verbsManager: this.verbsManager
    });
    
  }

  setSpy(spy: Spy): void {
    this.spy = spy;
  
    // transfer knowledge
    this.valueManager.spy = spy;
    this.synManager.spy = spy;
    this.choosebestManager.spy = spy;
    this.verbsManager.spy = spy;
    this.refsManager.spy = spy;
    this.adjectiveManager.spy = spy;
    this.asmManager.spy = spy;
    this.helper.spy = spy;
    this.substantiveManager.spy = spy;
    this.possessiveManager.spy = spy;
    this.nominalGroupManager.spy = spy;
    this.saveRollbackManager.spy = spy;
  }

  filterAll(unfiltered:string):string {

    // we don't make the final global filtering if some parts of the text have already been filtered before
    if (this.hasFilteredInMixin) {
      // debug('WE WONT FILTER TWICE');
      return unfiltered;
    } else {

      if (this.disableFiltering) {
        return unfiltered;
      }
      return filter(unfiltered, this.language);

    }
    
  }

}

