/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValueManager } from './ValueManager';
import { SynManager, SynoMode } from './SynManager';
import { ChoosebestManager } from './ChoosebestManager';
import { VerbsManager } from './VerbsManager';
import { RefsManager } from './RefsManager';
import { filter } from 'rosaenlg-filter';
import { AdjectiveManager } from './AdjectiveManager';
import { AsmManager } from './AsmManager';
import { Helper } from './Helper';
import { PossessiveManager } from './PossessiveManager';
import { SentenceManager } from './SentenceManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { RandomManager } from './RandomManager';
import { SpyI, SpyNoPug } from './Spy';
import { Constants, getIso2fromLocale, LinguisticResources } from 'rosaenlg-commons';

import { LanguageImpl } from './LanguageImpl';
import { languageImplfromIso2 } from './languageHelper';

import numeral from 'numeral';
import { GenderNumberManager } from './GenderNumberManager';
import { SaidManager } from './SaidManager';

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | 'es_ES' | 'zh_CN' | string;
export type Genders = 'M' | 'F' | 'N';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';
export type Persons = 1 | 2 | 3;
export interface RosaeNlgParams {
  language: Languages;
  forceRandomSeed?: number;
  defaultSynoMode?: SynoMode;
  defaultAmong?: number;
  renderDebug: boolean | undefined;
}

export function getRosaeNlgVersion(): string {
  return 'PLACEHOLDER_ROSAENLG_VERSION'; // will be replaced by gulp when copied into dist/
}

export class NlgLib {
  private _valueManager: ValueManager;
  public get valueManager(): ValueManager {
    return this._valueManager;
  }

  private _synManager: SynManager;
  public get synManager(): SynManager {
    return this._synManager;
  }

  private _choosebestManager: ChoosebestManager;
  public get choosebestManager(): ChoosebestManager {
    return this._choosebestManager;
  }

  private _verbsManager: VerbsManager;
  public get verbsManager(): VerbsManager {
    return this._verbsManager;
  }

  private _refsManager: RefsManager;
  public get refsManager(): RefsManager {
    return this._refsManager;
  }

  private _adjectiveManager: AdjectiveManager;
  public get adjectiveManager(): AdjectiveManager {
    return this._adjectiveManager;
  }

  private _asmManager: AsmManager;
  public get asmManager(): AsmManager {
    return this._asmManager;
  }

  private _helper: Helper;
  public get helper(): Helper {
    return this._helper;
  }

  private _possessiveManager: PossessiveManager;
  public get possessiveManager(): PossessiveManager {
    return this._possessiveManager;
  }

  private _saveRollbackManager: SaveRollbackManager;
  public get saveRollbackManager(): SaveRollbackManager {
    return this._saveRollbackManager;
  }

  private _randomManager: RandomManager;
  public get randomManager(): RandomManager {
    return this._randomManager;
  }

  private _genderNumberManager: GenderNumberManager;
  public get genderNumberManager(): GenderNumberManager {
    return this._genderNumberManager;
  }

  private _saidManager: SaidManager;
  public get saidManager(): SaidManager {
    return this._saidManager;
  }

  private _sentenceManager: SentenceManager;
  public get sentenceManager(): SentenceManager {
    return this._sentenceManager;
  }

  private embeddedLinguisticResources: LinguisticResources | undefined = undefined;
  private _spy: SpyI | undefined = undefined;
  public get spy(): SpyI {
    return this._spy as SpyI;
  }

  public randomSeed: number; // is read in the output, thus public
  private language: Languages;
  private _languageImpl: LanguageImpl;
  public get languageImpl(): LanguageImpl {
    return this._languageImpl;
  }

  private renderDebug: boolean | undefined;

  public numeral: Numeral;

  public constructor(params: RosaeNlgParams) {
    // forceRandomSeed can be 0 and be valid so test not null
    this.randomSeed =
      params && params.forceRandomSeed != null ? params.forceRandomSeed : Math.floor(Math.random() * 1000); //NOSONAR
    //console.log("seed: " + this.randomSeed);
    this._randomManager = new RandomManager(this.randomSeed);

    if (params && params.language) {
      this.language = params.language;
    } else {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `must provide a language ('language' param)`;
      throw err;
    }

    this.renderDebug = params.renderDebug;

    const iso2 = getIso2fromLocale(this.language);
    this._languageImpl = languageImplfromIso2(iso2);

    {
      // referencing libs for custom user usage

      // for numeral
      this.numeral = numeral;
    }

    this._saveRollbackManager = new SaveRollbackManager();

    this._genderNumberManager = new GenderNumberManager(this.languageImpl);
    this._helper = new Helper(
      this.genderNumberManager,
      this.saveRollbackManager,
      this.languageImpl,
      params.renderDebug,
    );
    this._synManager = new SynManager(this.randomManager, this.saveRollbackManager, this.helper, {
      defaultSynoMode: params.defaultSynoMode || 'random',
    });
    this._verbsManager = new VerbsManager(
      this.languageImpl,
      this.genderNumberManager,
      this.synManager,
      this.saveRollbackManager,
      this.helper,
    );

    this._choosebestManager = new ChoosebestManager(
      this.language,
      this.helper,
      this.saveRollbackManager,
      this.randomManager,
      params.defaultAmong || 5,
    );

    this._saidManager = new SaidManager();
    this._refsManager = new RefsManager(this.saveRollbackManager, this.genderNumberManager, this.randomManager);
    this._adjectiveManager = new AdjectiveManager(
      this.languageImpl,
      this.genderNumberManager,
      this.synManager,
      this.saveRollbackManager,
      this.helper,
    );
    this._possessiveManager = new PossessiveManager(
      this.languageImpl,
      this.genderNumberManager,
      this.refsManager,
      this.helper,
    );

    this._valueManager = new ValueManager(
      this.languageImpl,
      this.refsManager,
      this.genderNumberManager,
      this.randomManager,
      this.adjectiveManager,
      this.helper,
      this.possessiveManager,
      this.synManager,
      this.saveRollbackManager,
      this.languageImpl.languageCommon.constants as Constants,
    );

    this._asmManager = new AsmManager(this.saveRollbackManager, this.randomManager, this.valueManager, this.helper);

    this._sentenceManager = new SentenceManager(
      this.languageImpl,
      this.verbsManager,
      this.valueManager,
      this.adjectiveManager,
      this.synManager,
      this.helper,
    );

    this.saveRollbackManager.bindObjects(
      this.saidManager,
      this.refsManager,
      this.genderNumberManager,
      this.randomManager,
      this.synManager,
      this.verbsManager,
    );

    this.languageImpl.setValueManager(this.valueManager); // ValueManager is created lately
    this.languageImpl.setVerbsManager(this.verbsManager);
    this.languageImpl.setRefsManager(this.refsManager);
    this.languageImpl.setGenderNumberManager(this.genderNumberManager);
    this.languageImpl.setHelper(this.helper);
    this.refsManager.setValueManager(this.valueManager);

    // spy is supposed to be set later on when using templates
    // but we can always create a default one!
    this.setSpy(new SpyNoPug());
  }

  public setEmbeddedLinguisticResources(embeddedLinguisticResources: LinguisticResources): void {
    this.embeddedLinguisticResources = embeddedLinguisticResources;

    if (this.embeddedLinguisticResources) {
      // verbs
      // WHY does it look different for words and adj?
      // => DictManager has not been implemented for verbs yet, that's all
      this.verbsManager.setEmbeddedVerbs(this.embeddedLinguisticResources.verbs);

      // words and adj
      // fr + de
      this.languageImpl.getDictManager().setEmbeddedWords(this.embeddedLinguisticResources.words);
      this.languageImpl.getDictManager().setEmbeddedAdj(this.embeddedLinguisticResources.adjectives);
    }
  }

  // when using Pug
  public setSpy(spy: SpyI): void {
    this._spy = spy;

    // transfer knowledge
    this.valueManager.setSpy(spy);
    this.synManager.setSpy(spy);
    this.choosebestManager.setSpy(spy);
    this.refsManager.setSpy(spy);
    this.adjectiveManager.setSpy(spy);
    this.asmManager.setSpy(spy);
    this.helper.setSpy(spy);
    this.possessiveManager.setSpy(spy);
    this.sentenceManager.setSpy(spy);
    this.saveRollbackManager.setSpy(spy);
    this.verbsManager.setSpy(spy);
    this.languageImpl.setSpy(spy);
  }

  // call is generated by pug-code-gen
  public getFiltered(): string {
    return filter(this.spy.getPugHtml(), this.languageImpl.getLanguageCommon(), { renderDebug: this.renderDebug });
  }

  public getSaidManager(): SaidManager {
    return this._saidManager;
  }

  public getLanguageImpl(): LanguageImpl {
    return this.languageImpl;
  }
}
