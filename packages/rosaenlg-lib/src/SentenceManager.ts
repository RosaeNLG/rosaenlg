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

// NEW

export type PersonForSentence = '1S' | '2S' | '3S' | '1P' | '2P' | '3P';

type Subject = any;
export interface SubjectGroup {
  subject?: Subject;
  person?: PersonForSentence;
  invertSubjectVerb?: boolean;
  noSubject?: boolean;
  params?: ValueParams;
}

// same as ConjParams TODO
export interface VerbalGroup {
  verb: string;
  pronominal?: boolean;
  tense?: string;
  // aux?: 'ETRE' | 'AVOIR'; // French only
}

export interface ObjGroup {
  obj: any;
  type: 'DIRECT' | 'INDIRECT';
  preposition?: string; // only for indirect
  params?: ValueParams;
}

export interface SentenceParams {
  subjectGroup: SubjectGroup;
  verbalGroup?: VerbalGroup;
  objGroups: ObjGroup[];
  negative?: boolean;
}

// OLD - should be deprecated at some point? or unified?

interface SubjectVerbParams extends ValueParams {
  invertSubjectVerb?: boolean;
  noSubject?: boolean;
}

export class SentenceManager {
  private languageImpl: LanguageImpl;
  private verbsManager: VerbsManager;
  private valueManager: ValueManager;
  private adjectiveManager: AdjectiveManager;
  private synManager: SynManager;
  private spy: SpyI | undefined = undefined;
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
  protected getSpy(): SpyI {
    return this.spy as SpyI;
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
      this.getSpy().appendPugHtml(this.verbsManager.getAgreeVerb(chosenSubject, null, verbInfo, params));
    } else {
      if (params && params.invertSubjectVerb) {
        this.getSpy().appendPugHtml(
          this.helper.getSeparatingSpace() +
            this.verbsManager.getAgreeVerb(chosenSubject, null, verbInfo, params) +
            this.helper.getSeparatingSpace(),
        );
        this.valueManager.value(chosenSubject, params);
      } else {
        // warning: value has side effects on chosenSubject, typically number
        // thus we cannot agree the verb before running value
        this.valueManager.value(chosenSubject, params);
        this.getSpy().appendPugHtml(
          this.helper.getSeparatingSpace() +
            this.verbsManager.getAgreeVerb(chosenSubject, null, verbInfo, params) +
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

  public sentence(sentenceParams: SentenceParams): void {
    // some checks are multilingual
    if (!sentenceParams.subjectGroup) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `sentence requires a subject group`;
      throw err;
    }
    if (!sentenceParams.subjectGroup.subject && !sentenceParams.subjectGroup.person) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `within a subject group, subject object or person is required`;
      throw err;
    }
    if (sentenceParams.verbalGroup && !sentenceParams.verbalGroup.verb) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verb is required in a verbal group of a sentence`;
      throw err;
    }
    if (sentenceParams.objGroups) {
      for (const objGroup of sentenceParams.objGroups) {
        if (objGroup.type !== 'DIRECT' && objGroup.type !== 'INDIRECT') {
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `group type is required: DIRECT or INDIRECT`;
          throw err;
        }
        if (!objGroup.obj) {
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `obj is required in a direct or indirect object group of a sentence`;
          throw err;
        }
      }
    }

    // realization is delegated for each language
    this.languageImpl.sentence(sentenceParams);
  }
}
