/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenderNumberManager } from './GenderNumberManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { SynManager } from './SynManager';
import { LanguageImpl } from './LanguageImpl';
import { SpyI } from './Spy';
import { Helper } from './Helper';
import { PersonForSentence } from './SentenceManager';
import { VerbsInfo } from 'rosaenlg-commons';

export interface ConjParams {
  verb: string;
  pronominal?: boolean;
  tense?: string;
}

export type VerbParts = string[];

export class VerbsManager {
  private languageImpl: LanguageImpl;
  private genderNumberManager: GenderNumberManager;
  private synManager: SynManager;
  private saveRollbackManager: SaveRollbackManager;
  private embeddedVerbs: VerbsInfo | undefined = undefined;
  private verbParts: VerbParts;
  protected spy: SpyI | undefined = undefined;
  private helper: Helper;

  public constructor(
    languageImpl: LanguageImpl,
    genderNumberManager: GenderNumberManager,
    synManager: SynManager,
    saveRollbackManager: SaveRollbackManager,
    helper: Helper,
  ) {
    this.languageImpl = languageImpl;
    this.genderNumberManager = genderNumberManager;
    this.synManager = synManager;
    this.saveRollbackManager = saveRollbackManager;
    this.helper = helper;

    this.verbParts = [];
  }

  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }
  protected getSpy(): SpyI {
    return this.spy as SpyI;
  }

  public getVerbPartsList(): VerbParts {
    return this.verbParts;
  }
  public setVerbPartsList(verbParts: VerbParts): void {
    this.verbParts = verbParts;
  }

  public setEmbeddedVerbs(embeddedVerbs: VerbsInfo): void {
    this.embeddedVerbs = embeddedVerbs;
  }

  private encapsulateConjParams(conjParams: string | ConjParams): ConjParams {
    if (typeof conjParams === 'object' && !Array.isArray(conjParams)) {
      // already in .verb prop
      return conjParams;
    } else {
      // direct arg: string or array
      return {
        verb: conjParams as any,
      };
    }
  }

  public getAgreeVerb(
    subject: any,
    person: PersonForSentence | null | undefined,
    conjParamsOriginal: string | ConjParams,
    additionalParams: any,
  ): string {
    if (this.saveRollbackManager.isEvaluatingEmpty) {
      return 'SOME_VERB';
    } else {
      const conjParams: ConjParams = this.encapsulateConjParams(conjParamsOriginal);

      const verbName: string = this.synManager.synFctHelper(conjParams.verb);

      if (!verbName) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `verb needed`;
        throw err;
      }

      const tense: string = (conjParams.tense || this.languageImpl.defaultTense) as string;

      let paramPerson = person;
      if (!paramPerson) {
        if (this.genderNumberManager.getRefNumber(subject, additionalParams) === 'P') {
          paramPerson = '3P';
        } else {
          paramPerson = '3S';
        }
      }

      return this.languageImpl.getConjugation(
        subject,
        verbName,
        tense,
        paramPerson,
        conjParams,
        this.embeddedVerbs,
        this.verbParts,
      );
    }
  }

  public popVerbPartInBuffer(): void {
    if (!this.languageImpl.canPopVerbPart) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart is not available for ${this.languageImpl.iso2}`;
      throw err;
    }

    const verb: string = this.verbParts.pop() as string;
    if (!verb) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart nothing to pop`;
      throw err;
    }

    this.getSpy().appendPugHtml(this.helper.getSeparatingSpace() + verb + this.helper.getSeparatingSpace());
  }
}
