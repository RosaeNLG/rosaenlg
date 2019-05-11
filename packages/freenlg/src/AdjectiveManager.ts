import { GenderNumberManager, WithGender, WithNumber } from './GenderNumberManager';
import { agree as agreeFrenchAdj } from '@freenlg/french-adjectives';
import { agreeGermanAdjective, DetTypes as GermanDetTypes } from '@freenlg/german-adjectives';
import { AdjectivesData } from '@freenlg/freenlg-pug-code-gen';

import { Languages, Genders, GendersMF, Numbers, GermanCases } from './NlgLib';
import { AdjPos } from './ValueManager';
import { DetTypes } from './Determiner';

//import * as Debug from "debug";
//const debug = Debug("freenlg");

interface AgreeAdjParams extends WithGender, WithNumber {
  adjPos: AdjPos;
  case: GermanCases;
  det: DetTypes;
}

export class AdjectiveManager {
  private language: Languages;
  private genderNumberManager: GenderNumberManager;
  private spy: Spy;
  private embeddedAdjs: AdjectivesData;

  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  public setEmbeddedAdj(embeddedAdjs: AdjectivesData): void {
    this.embeddedAdjs = embeddedAdjs;
  }

  public constructor(language: Languages, genderNumberManager: GenderNumberManager) {
    this.language = language;
    this.genderNumberManager = genderNumberManager;
  }

  public agreeAdj(adjective: string, subject: any, params: any): void {
    this.spy.appendDoubleSpace();
    this.spy.appendPugHtml(this.getAgreeAdj(adjective, subject, params));
    this.spy.appendDoubleSpace();
  }

  public getAgreeAdj(adjective: string, subject: any, params: AgreeAdjParams): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_ADJ';
    } else {
      // debug(`getAgreeAdj ${adjective} ${JSON.stringify(subject)} ${JSON.stringify(params)}`);

      let gender: Genders = this.genderNumberManager.getRefGender(subject, params);
      let number: Numbers = this.genderNumberManager.getRefNumber(subject, params) || 'S';

      // debug('agreeAdj:' + ' gender=' + gender + ' number=' + number + ' / ' + adjective + ' / ' + JSON.stringify(subject).substring(0, 20) );

      switch (this.language) {
        case 'en_US':
          // no agreement for adjectives in English
          return adjective;
        case 'fr_FR':
          return agreeFrenchAdj(
            adjective,
            gender as GendersMF,
            number,
            subject,
            params != null && params.adjPos == 'BEFORE',
          );
        case 'de_DE':
          return agreeGermanAdjective(
            adjective,
            params.case,
            gender,
            number,
            params.det as GermanDetTypes,
            this.embeddedAdjs,
          );
      }
    }
  }
}
