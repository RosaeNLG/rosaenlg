/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenderNumberManager } from './GenderNumberManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { SynManager } from './SynManager';
import { LanguageImpl } from './LanguageImpl';
import { VerbsData } from 'rosaenlg-pug-code-gen';

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

  private embeddedVerbs: VerbsData;
  private verbParts: VerbParts;

  public constructor(
    languageImpl: LanguageImpl,
    genderNumberManager: GenderNumberManager,
    synManager: SynManager,
    saveRollbackManager: SaveRollbackManager,
  ) {
    this.languageImpl = languageImpl;
    this.genderNumberManager = genderNumberManager;
    this.synManager = synManager;
    this.saveRollbackManager = saveRollbackManager;

    this.verbParts = [];
  }

  public getVerbPartsList(): VerbParts {
    return this.verbParts;
  }
  public setVerbPartsList(verbParts: VerbParts): void {
    this.verbParts = verbParts;
  }

  public setEmbeddedVerbs(embeddedVerbs: VerbsData): void {
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

  public getAgreeVerb(subject: any, conjParamsOriginal: string | ConjParams, additionalParams: any): string {
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

      const tense: string = conjParams.tense || this.languageImpl.defaultTense;

      const number: 'S' | 'P' = this.genderNumberManager.getRefNumber(subject, additionalParams) || 'S';

      return this.languageImpl.getConjugation(
        subject,
        verbName,
        tense,
        number,
        conjParams,
        this.genderNumberManager,
        this.embeddedVerbs,
        this.verbParts,
      );
    }
  }

  public popVerbPart(): string {
    if (!this.languageImpl.canPopVerbPart) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart is not available for ${this.languageImpl.iso2}`;
      throw err;
    }

    const verb: string = this.verbParts.pop();
    if (!verb) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart nothing to pop`;
      throw err;
    }
    return verb;
  }
}
