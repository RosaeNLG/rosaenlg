import * as Debug from "debug";
const debug = Debug("freenlg");
import { VerbsManager } from "./VerbsManager";
import { ValueManager } from "./ValueManager";
import { AdjectiveManager } from "./AdjectiveManager";

export class NominalGroupManager {
  language: string;
  verbsManager: VerbsManager;
  valueManager: ValueManager;
  adjectiveManager: AdjectiveManager;
  spy: Spy;

  verb_parts: string[];

  constructor(params: any) {
    this.language = params.language;
    this.verbsManager = params.verbsManager;
    this.valueManager = params.valueManager;
    this.adjectiveManager = params.adjectiveManager;
  }

  subjectVerb(subject:any, verbInfo:any, params:any): void  {

    if (params!=null && params.invertSubjectVerb!=null) {
      if (this.language!='de_DE') {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invertSubjectVerb is only valid for de_DE`;
        throw err;
      }
      if (typeof params.invertSubjectVerb !== "boolean") {
        var err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `invertSubjectVerb must be a boolean`;
        throw err;
      }      
    }

    if (params!=null && params.invertSubjectVerb==true) {
      this.spy.appendPugHtml( this.verbsManager.getAgreeVerb(subject, verbInfo) + ' ' );
      this.valueManager.value(subject, params);
    } else {
      this.valueManager.value(subject, params);
      this.spy.appendPugHtml( ' ' + this.verbsManager.getAgreeVerb(subject, verbInfo) );      
    }


  }

  subjectVerbAdj(subject:any, verbInfo:any, adjective:string, params:any): void  {
    this.subjectVerb(subject, verbInfo, params);
    this.spy.appendPugHtml(' ');
    this.adjectiveManager.agreeAdj(adjective, subject, params);
  }
}
