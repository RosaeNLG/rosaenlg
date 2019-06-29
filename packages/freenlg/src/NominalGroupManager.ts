//import * as Debug from "debug";
//const debug = Debug("freenlg");
import { VerbsManager } from './VerbsManager';
import { ValueManager, ValueParams } from './ValueManager';
import { AdjectiveManager } from './AdjectiveManager';
import { Languages } from './NlgLib';

interface SubjectVerbParams extends ValueParams {
  invertSubjectVerb: boolean;
}

export class NominalGroupManager {
  private language: Languages;
  private verbsManager: VerbsManager;
  private valueManager: ValueManager;
  private adjectiveManager: AdjectiveManager;
  private spy: Spy;

  public constructor(
    language: Languages,
    verbsManager: VerbsManager,
    valueManager: ValueManager,
    adjectiveManager: AdjectiveManager,
  ) {
    this.language = language;
    this.verbsManager = verbsManager;
    this.valueManager = valueManager;
    this.adjectiveManager = adjectiveManager;
  }
  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  public subjectVerb(subject: any, verbInfo: any, params: SubjectVerbParams): void {
    if (params != null && params.invertSubjectVerb != null) {
      if (this.language != 'de_DE') {
        let err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invertSubjectVerb is only valid for de_DE`;
        throw err;
      }
      if (typeof params.invertSubjectVerb !== 'boolean') {
        let err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invertSubjectVerb must be a boolean`;
        throw err;
      }
    }

    if (params != null && params.invertSubjectVerb == true) {
      this.spy.appendPugHtml(this.verbsManager.getAgreeVerb(subject, verbInfo) + ' ');
      this.valueManager.value(subject, params);
    } else {
      this.valueManager.value(subject, params);
      this.spy.appendPugHtml(' ' + this.verbsManager.getAgreeVerb(subject, verbInfo));
    }
  }

  public subjectVerbAdj(subject: any, verbInfo: any, adjective: string, params: any): void {
    this.subjectVerb(subject, verbInfo, params);
    this.spy.appendPugHtml(' ');
    this.adjectiveManager.agreeAdj(adjective, subject, params);
  }
}
