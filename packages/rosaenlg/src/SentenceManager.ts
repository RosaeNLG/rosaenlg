/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerbsManager } from './VerbsManager';
import { ValueManager, ValueParams } from './ValueManager';
import { AdjectiveManager, Adjective } from './AdjectiveManager';
import { SynManager } from './SynManager';
import { LanguageImpl } from './LanguageImpl';
import { SpyI } from './Spy';
import { Helper } from './Helper';

interface SubjectVerbParams extends ValueParams {
  invertSubjectVerb: boolean;
  noSubject: boolean;
}

export class SentenceManager {
  private languageImpl: LanguageImpl;
  private verbsManager: VerbsManager;
  private valueManager: ValueManager;
  private adjectiveManager: AdjectiveManager;
  private synManager: SynManager;
  private spy: SpyI;
  private helper: Helper;

  public constructor(
    languageImpl: LanguageImpl,
    verbsManager: VerbsManager,
    valueManager: ValueManager,
    adjectiveManager: AdjectiveManager,
    synManager: SynManager,
    helper: Helper,
  ) {
    this.languageImpl = languageImpl;
    this.verbsManager = verbsManager;
    this.valueManager = valueManager;
    this.adjectiveManager = adjectiveManager;
    this.synManager = synManager;
    this.helper = helper;
  }
  public setSpy(spy: SpyI): void {
    this.spy = spy;
  }

  public verb(subject: any, verbInfo: any, params: SubjectVerbParams): void {
    this.subjectVerb(subject, verbInfo, { ...params, noSubject: true });
  }

  public subjectVerb(subject: any, verbInfo: any, params: SubjectVerbParams): void {
    // might have been done before if we go through subjectVerbAdj
    // but not if we use the mixin directly
    const chosenSubject = this.synManager.synFctHelper(subject);

    if (params && params.invertSubjectVerb) {
      if (!this.languageImpl.supportsInvertSubjectVerb) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invertSubjectVerb is only valid for de_DE`;
        throw err;
      }
      if (typeof params.invertSubjectVerb !== 'boolean') {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invertSubjectVerb must be a boolean`;
        throw err;
      }
    }

    if (params && params.noSubject) {
      this.spy.appendPugHtml(this.verbsManager.getAgreeVerb(chosenSubject, verbInfo, params));
    } else {
      if (params && params.invertSubjectVerb) {
        this.spy.appendPugHtml(
          this.helper.getSeparatingSpace() +
            this.verbsManager.getAgreeVerb(chosenSubject, verbInfo, params) +
            this.helper.getSeparatingSpace(),
        );
        this.valueManager.value(chosenSubject, params);
      } else {
        // warning: value has side effects on chosenSubject, typically number
        // thus we cannot agree the verb before running value
        this.valueManager.value(chosenSubject, params);
        this.spy.appendPugHtml(
          this.helper.getSeparatingSpace() +
            this.verbsManager.getAgreeVerb(chosenSubject, verbInfo, params) +
            this.helper.getSeparatingSpace(),
        );
      }
    }
  }

  public subjectVerbAdj(subject: any, verbInfo: any, adjective: Adjective, params: any): void {
    const chosenSubject = this.synManager.synFctHelper(subject);

    this.subjectVerb(chosenSubject, verbInfo, params);
    // this already adds spaces
    this.adjectiveManager.agreeAdj(adjective, chosenSubject, params);
  }
}
