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
import { getIso2fromLocale } from 'rosaenlg-commons';

import { LanguageImpl } from './LanguageImpl';
import { languageImplfromIso2 } from './languageHelper';

import numeral from 'numeral';
import { GenderNumberManager } from './GenderNumberManager';
import { SaidManager } from './SaidManager';
import { LinguisticResources } from 'rosaenlg-pug-code-gen';

export type Languages = 'en_US' | 'fr_FR' | 'de_DE' | 'it_IT' | 'es_ES' | 'zh_CN' | string;
export type Genders = 'M' | 'F' | 'N';
export type GendersMF = 'M' | 'F';
export type Numbers = 'S' | 'P';

export interface RosaeNlgParams {
  language: Languages;
  forceRandomSeed?: number;
  defaultSynoMode?: SynoMode;
  defaultAmong?: number;
  renderDebug?: boolean;
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
  private possessiveManager: PossessiveManager;
  private saveRollbackManager: SaveRollbackManager;
  private randomManager: RandomManager;
  private genderNumberManager: GenderNumberManager;
  private saidManager: SaidManager;
  private sentenceManager: SentenceManager;

  private embeddedLinguisticResources: LinguisticResources;
  private spy: SpyI;
  public randomSeed: number; // is read in the output, thus public
  private language: Languages;
  private languageImpl: LanguageImpl;
  private renderDebug: boolean;

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

    this.renderDebug = params.renderDebug;

    const iso2 = getIso2fromLocale(this.language);
    this.languageImpl = languageImplfromIso2(iso2);

    {
      // referencing libs for custom user usage

      // for numeral
      this.numeral = numeral;
    }

    this.saveRollbackManager = new SaveRollbackManager();

    this.genderNumberManager = new GenderNumberManager(this.languageImpl);
    this.helper = new Helper(this.genderNumberManager, this.saveRollbackManager, this.languageImpl, params.renderDebug);
    this.synManager = new SynManager(this.randomManager, this.saveRollbackManager, this.helper, {
      defaultSynoMode: params.defaultSynoMode || 'random',
    });
    this.verbsManager = new VerbsManager(
      this.languageImpl,
      this.genderNumberManager,
      this.synManager,
      this.saveRollbackManager,
      this.helper,
    );

    this.choosebestManager = new ChoosebestManager(
      this.language,
      this.helper,
      this.saveRollbackManager,
      this.randomManager,
      params.defaultAmong || 5,
    );

    this.saidManager = new SaidManager();
    this.refsManager = new RefsManager(this.saveRollbackManager, this.genderNumberManager, this.randomManager);
    this.adjectiveManager = new AdjectiveManager(
      this.languageImpl,
      this.genderNumberManager,
      this.synManager,
      this.saveRollbackManager,
      this.helper,
    );
    this.possessiveManager = new PossessiveManager(
      this.languageImpl,
      this.genderNumberManager,
      this.refsManager,
      this.helper,
    );

    this.valueManager = new ValueManager(
      this.languageImpl,
      this.refsManager,
      this.genderNumberManager,
      this.randomManager,
      this.adjectiveManager,
      this.helper,
      this.possessiveManager,
      this.synManager,
      this.saveRollbackManager,
      this.languageImpl.languageCommon.constants,
    );

    this.asmManager = new AsmManager(this.saveRollbackManager, this.randomManager, this.valueManager, this.helper);

    this.sentenceManager = new SentenceManager(
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
    this.spy = spy;

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
    return this.saidManager;
  }

  public getLanguageImpl(): LanguageImpl {
    return this.languageImpl;
  }
}
