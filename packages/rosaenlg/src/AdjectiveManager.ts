/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { GenderNumberManager } from './GenderNumberManager';
import { SynManager } from './SynManager';
import { EATSPACE } from 'rosaenlg-filter';
import { Genders, Numbers } from './NlgLib';
import { LanguageImpl, AgreeAdjParams } from './LanguageImpl';

export type Adjective = string | string[];

export class AdjectiveManager {
  private languageImpl: LanguageImpl;
  private genderNumberManager: GenderNumberManager;
  private synManager: SynManager;

  private spy: Spy;

  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  public constructor(languageImpl: LanguageImpl, genderNumberManager: GenderNumberManager, synManager: SynManager) {
    this.languageImpl = languageImpl;
    this.genderNumberManager = genderNumberManager;
    this.synManager = synManager;
  }

  // when using the mixin
  public agreeAdj(adjective: Adjective, subject: any, params: any): void {
    if (this.spy.isEvaluatingEmpty()) {
      this.spy.appendPugHtml('SOME_ADJ'); // as is called directly through a mixin
    } else {
      this.spy.appendDoubleSpace();

      const adj: string = this.synManager.synFctHelper(adjective);

      const agreedAdj = this.getAgreeAdj(adj, subject, params);
      this.spy.appendPugHtml(agreedAdj);

      if (this.languageImpl.eatSpaceWhenAdjEndsWithApostrophe && agreedAdj.endsWith("'")) {
        // bell'uomo in Italian
        this.spy.appendPugHtml(`¤${EATSPACE}¤`);
      }

      this.spy.appendDoubleSpace();
    }
  }

  public getAgreeAdj(adjective: string, subject: any, params: AgreeAdjParams): string {
    // no need to test for isEvaluatingEmpty as only called through value or agreeAdj mixins
    // console.log(`getAgreeAdj ${adjective} ${JSON.stringify(subject)} ${JSON.stringify(params)}`);

    const gender: Genders = this.genderNumberManager.getRefGender(subject, params);

    // if subject is a word we can extract gender from it, but not the number
    const number: Numbers = this.genderNumberManager.getRefNumber(subject, params) || 'S';

    return this.languageImpl.getAgreeAdj(adjective, gender, number, subject, params);
  }
}
