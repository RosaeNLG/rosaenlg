/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenderNumberManager } from './GenderNumberManager';
import { SaveRollbackManager } from './SaveRollbackManager';
import { SpyI } from './Spy';
import { SynManager } from './SynManager';
import { Helper } from './Helper';
import { EATSPACE } from 'rosaenlg-filter';
import { Genders, Numbers } from './NlgLib';
import { LanguageImpl, AgreeAdjParams } from './LanguageImpl';

export type Adjective = string | string[];

export class AdjectiveManager {
  private languageImpl: LanguageImpl;
  private genderNumberManager: GenderNumberManager;
  private synManager: SynManager;
  private saveRollbackManager: SaveRollbackManager;
  private helper: Helper;

  private spy: SpyI | null = null;

  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }
  private getSpy(): SpyI {
    return this.spy as SpyI;
  }

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
  }

  // when using the mixin
  public agreeAdj(adjective: Adjective, subject: any, params: any): void {
    if (this.saveRollbackManager.isEvaluatingEmpty) {
      this.getSpy().appendPugHtml('SOME_ADJ'); // as is called directly through a mixin
    } else {
      this.helper.insertSeparatingSpaceIfRequired();

      const adj: string = this.synManager.synFctHelper(adjective);

      const agreedAdj = this.getAgreeAdj(adj, subject, params);
      this.getSpy().appendPugHtml(agreedAdj);

      if (this.languageImpl.eatSpaceWhenAdjEndsWithApostrophe && agreedAdj.endsWith("'")) {
        // bell'uomo in Italian
        this.getSpy().appendPugHtml(`¤${EATSPACE}¤`);
      }

      this.helper.insertSeparatingSpaceIfRequired();
    }
  }

  public getAgreeAdj(adjective: string, subject: any, params: AgreeAdjParams): string {
    // no need to test for isEvaluatingEmpty as only called through value or agreeAdj mixins
    // console.log(`getAgreeAdj ${adjective} ${JSON.stringify(subject)} ${JSON.stringify(params)}`);

    const gender: Genders | undefined = this.genderNumberManager.getRefGender(subject, params);

    // if subject is a word we can extract gender from it, but not the number
    const number: Numbers = this.genderNumberManager.getRefNumber(subject, params) || 'S';

    return this.languageImpl.getAgreeAdj(adjective, gender, number, subject, params);
  }
}
