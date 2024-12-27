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
import { Voice } from 'french-verbs';

export interface ConjParams {
  verb: string;
  pronominal?: boolean;
  splitPrefix?: boolean; // German only
  tense?: string;
  voice?: Voice;
}

export type VerbParts = string[];
export type VerbPrefixes = string[];

export class VerbsManager {
  private languageImpl: LanguageImpl;
  private genderNumberManager: GenderNumberManager;
  private synManager: SynManager;
  private saveRollbackManager: SaveRollbackManager;
  private embeddedVerbs: VerbsInfo | undefined = undefined;
  private verbParts: VerbParts;
  private verbPrefixes: VerbPrefixes;
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
    this.verbPrefixes = [];
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
  public getVerbPrefixesList(): VerbPrefixes {
    return this.verbPrefixes;
  }
  public setVerbPrefixes(verbPrefixes: VerbPrefixes): void {
    this.verbPrefixes = verbPrefixes;
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
        this.verbPrefixes,
      );
    }
  }

  private doPopHelper(toPop: string[]) {
    const popped: string = toPop.pop() as string;
    if (!popped) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `nothing to pop`;
      throw err;
    }
    this.getSpy().appendPugHtml(this.helper.getSeparatingSpace() + popped + this.helper.getSeparatingSpace());
  }

  public popVerbPartInBuffer(): void {
    if (!this.languageImpl.canPopVerbPart) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart is not available for ${this.languageImpl.iso2}`;
      throw err;
    }
    this.doPopHelper(this.verbParts);
  }

  public popVerbPrefixInBuffer(): void {
    if (!this.languageImpl.canPopVerbPrefix) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPrefix is not available for ${this.languageImpl.iso2}`;
      throw err;
    }
    this.doPopHelper(this.verbPrefixes);
  }

  public isVerbWithPrefix(verb: string): boolean | undefined {
    return this.languageImpl.isVerbWithPrefix(verb, this.embeddedVerbs);
  }
}
