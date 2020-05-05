import { ValueManager } from './ValueManager';
import { SynManager, SynoMode } from './SynManager';
import { ChoosebestManager } from './ChoosebestManager';
import { VerbsManager } from './VerbsManager';
import { RefsManager } from './RefsManager';
import { filter } from 'rosaenlg-filter';
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
import { MorphItHelper } from 'morph-it-helper';

import moment from 'moment';
import numeral from 'numeral';
import { GenderNumberManager } from './GenderNumberManager';
import { SaidManager } from './SaidManager';
import { LinguisticResources } from 'rosaenlg-pug-code-gen';

//import * as Debug from 'debug';
//const debug = Debug('rosaenlg');

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | 'es_ES' | string;
export type Genders = 'M' | 'F' | 'N';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type GermanCases = 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE';
export type DictHelper = LefffHelper | GermanDictHelper | MorphItHelper;

export interface RosaeNlgParams {
  language: Languages;
  forceRandomSeed?: number;
  defaultSynoMode?: SynoMode;
  defaultAmong?: number;
}

export function getRosaeNlgVersion(): string {
  return 'PLACEHOLDER_ROSAENLG_VERSION'; // will be replaced by gulp when copied into dist/
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

  public moment: any;
  public numeral: Numeral;

  public constructor(params: RosaeNlgParams) {
    // forceRandomSeed can be 0 and be valid so test not null
    this.randomSeed =
      params && params.forceRandomSeed != null ? params.forceRandomSeed : Math.floor(Math.random() * 1000); //NOSONAR
    //console.log("seed: " + this.randomSeed);
    this.randomManager = new RandomManager(this.randomSeed);

    if (params && params.language) {
      this.language = params.language;
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `must provide a language ('language' param)`;
      throw err;
    }

    {
      // referencing libs for custom user usage

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

    this.asmManager = new AsmManager(this.language, this.saveRollbackManager, this.randomManager);
    this.saidManager = new SaidManager();
    this.refsManager = new RefsManager(this.saveRollbackManager, this.genderNumberManager, this.randomManager);
    this.adjectiveManager = new AdjectiveManager(this.language, this.genderNumberManager);
    this.substantiveManager = new SubstantiveManager(this.language);
    this.possessiveManager = new PossessiveManager(
      this.language,
      this.genderNumberManager,
      this.refsManager,
      this.helper,
    );

    try {
      switch (this.language) {
        case 'fr_FR': {
          this.dictHelper = new LefffHelper();
          break;
        }
        case 'de_DE': {
          this.dictHelper = new GermanDictHelper();
          break;
        }
        case 'it_IT': {
          this.dictHelper = new MorphItHelper();
          break;
        }
        case 'en_US':
        case 'es_ES':
        default:
        // nothing
      }
    } catch (err) {
      // console.log('well, we are in browser');
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
      this.asmManager,
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
    // this.substantiveManager.setSpy(spy);
    this.possessiveManager.setSpy(spy);
    this.nominalGroupManager.setSpy(spy);
    this.saveRollbackManager.setSpy(spy);

    // console.log('before trying to get embeddedLinguisticResources');
    this.embeddedLinguisticResources = this.spy.getEmbeddedLinguisticResources();
    // console.log(`NlgLib just got resources: ${JSON.stringify(this.embeddedLinguisticResources)}`);

    if (this.embeddedLinguisticResources) {
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
    return filter(unfiltered, this.language);
  }

  public getSaidManager(): SaidManager {
    return this.saidManager;
  }
}
