import { ValueManager } from './ValueManager';
import { SynManager, SynoMode } from './SynManager';
import { ChoosebestManager } from './ChoosebestManager';
import { VerbsManager } from './VerbsManager';
import { RefsManager } from './RefsManager';
import { filter } from 'freenlg-filter';
import { AdjectiveManager } from './AdjectiveManager';
import { AsmManager } from './AsmManager';
import { Helper } from './Helper';
import { SubstantiveManager } from './SubstantiveManager';
import { PossessiveManager } from './PossessiveManager';
import { NominalGroupManager } from './NominalGroupManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { RandomManager } from './RandomManager';
import { LefffHelper } from 'lefff-helper';
import { GermanDictHelper } from 'german-dict-helper';

import * as compromise from 'compromise';
import * as moment from 'moment';
import * as numeral from 'numeral';
import { GenderNumberManager } from './GenderNumberManager';
import { SaidManager } from './SaidManager';
import { LinguisticResources } from 'freenlg-pug-code-gen';

//import * as Debug from 'debug';
//const debug = Debug('freenlg');

export type Languages = 'en_US' | 'fr_FR' | 'de_DE';
export type Genders = 'M' | 'F' | 'N';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type DictHelper = LefffHelper | GermanDictHelper;

export interface FreeNlgParams {
  language: Languages;
  forceRandomSeed: number;
  disableFiltering: boolean;
  defaultSynoMode: SynoMode;
  defaultAmong: number;
}

export class NlgLib {
  private valueManager: ValueManager;
  private synManager: SynManager;
  private choosebestManager: ChoosebestManager;
  private verbsManager: VerbsManager;
  private refsManager: RefsManager;
  private adjectiveManager: AdjectiveManager;
  private asmManager: AsmManager;
  private helper: Helper;
  private substantiveManager: SubstantiveManager;
  private possessiveManager: PossessiveManager;
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private genderNumberManager: GenderNumberManager;
  private saidManager: SaidManager;
  private nominalGroupManager: NominalGroupManager;

  private dictHelper: DictHelper;

  private embeddedLinguisticResources: LinguisticResources;
  private spy: Spy;
  private randomSeed: number;
  private language: Languages;
  private disableFiltering: boolean;

  public compromise: any;
  public moment: any;
  public numeral: Numeral;

  public hasFilteredInMixin: boolean = false;
  // to be called in filter mixin
  public filterFct: any = filter;

  public constructor(params: FreeNlgParams) {
    const supportedLanguages: string[] = ['fr_FR', 'en_US', 'de_DE'];

    this.randomSeed =
      params != null && params.forceRandomSeed != null ? params.forceRandomSeed : Math.floor(Math.random() * 1000);
    // debug("seed: " + this.randomSeed);
    this.randomManager = new RandomManager(this.randomSeed);

    if (params != null && params.language != null) {
      this.language = params.language;
      if (supportedLanguages.indexOf(this.language) == -1) {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `provided language is ${
          this.language
        } while supported languages are ${supportedLanguages.join()}`;
        throw err;
      }
    } else {
      var err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `must provide a language`;
      throw err;
    }

    if (params != null && params.disableFiltering == true) {
      this.disableFiltering = true;
    }

    {
      // referencing compromise for custom user usage
      if (this.language == 'en_US') {
        // debug('USING compromise lib');
        this.compromise = compromise;
      } else if (this.language == 'fr_FR') {
      }

      // same for moment
      this.moment = moment;

      // same for numeral
      this.numeral = numeral;
    }

    this.saveRollbackManager = new SaveRollbackManager();

    this.genderNumberManager = new GenderNumberManager(this.language);
    this.helper = new Helper(this.genderNumberManager);
    this.verbsManager = new VerbsManager(this.language, this.genderNumberManager);
    this.synManager = new SynManager(this.randomManager, this.saveRollbackManager, params.defaultSynoMode || 'random');

    this.choosebestManager = new ChoosebestManager(
      this.language,
      this.saveRollbackManager,
      this.randomManager,
      params.defaultAmong || 5,
    );

    this.asmManager = new AsmManager(this.saveRollbackManager, this.randomManager);
    this.saidManager = new SaidManager();
    this.refsManager = new RefsManager(this.saveRollbackManager, this.genderNumberManager, this.randomManager);
    this.adjectiveManager = new AdjectiveManager(this.language, this.genderNumberManager);
    this.substantiveManager = new SubstantiveManager(this.language, this.genderNumberManager);
    this.possessiveManager = new PossessiveManager(
      this.language,
      this.genderNumberManager,
      this.refsManager,
      this.helper,
    );

    switch (this.language) {
      case 'fr_FR':
        try {
          this.dictHelper = new LefffHelper();
        } catch (err) {
          // console.log('well, we are in browser');
        }
        break;
      case 'de_DE':
        try {
          this.dictHelper = new GermanDictHelper();
        } catch (err) {
          // console.log('well, we are in browser');
        }
        break;
      case 'en_US':
      // nothing
    }

    this.valueManager = new ValueManager(
      this.language,
      this.refsManager,
      this.genderNumberManager,
      this.randomManager,
      this.adjectiveManager,
      this.substantiveManager,
      this.helper,
      this.possessiveManager,
      this.dictHelper,
    );

    this.nominalGroupManager = new NominalGroupManager(
      this.language,
      this.verbsManager,
      this.valueManager,
      this.adjectiveManager,
    );

    this.saveRollbackManager.bindObjects(
      this.saidManager,
      this.refsManager,
      this.genderNumberManager,
      this.randomManager,
      this.synManager,
      this.verbsManager,
    );
  }

  public setSpy(spy: Spy): void {
    this.spy = spy;

    // transfer knowledge
    this.valueManager.setSpy(spy);
    this.synManager.setSpy(spy);
    this.choosebestManager.setSpy(spy);
    this.verbsManager.setSpy(spy);
    this.refsManager.setSpy(spy);
    this.adjectiveManager.setSpy(spy);
    this.asmManager.setSpy(spy);
    this.helper.setSpy(spy);
    this.substantiveManager.setSpy(spy);
    this.possessiveManager.setSpy(spy);
    this.nominalGroupManager.setSpy(spy);
    this.saveRollbackManager.setSpy(spy);

    // console.log('before trying to get embeddedLinguisticResources');
    this.embeddedLinguisticResources = this.spy.getEmbeddedLinguisticResources();
    // console.log(`NlgLib just got resources: ${JSON.stringify(this.embeddedLinguisticResources)}`);

    if (this.embeddedLinguisticResources != null) {
      // verbs
      this.verbsManager.setEmbeddedVerbs(this.embeddedLinguisticResources.verbs);

      // words
      // fr + de
      this.genderNumberManager.setEmbeddedWords(this.embeddedLinguisticResources.words);
      // de only
      this.substantiveManager.setEmbeddedWords(this.embeddedLinguisticResources.words);
      this.possessiveManager.setEmbeddedWords(this.embeddedLinguisticResources.words);
      this.adjectiveManager.setEmbeddedAdj(this.embeddedLinguisticResources.adjectives);
    }
  }

  public filterAll(unfiltered: string): string {
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
