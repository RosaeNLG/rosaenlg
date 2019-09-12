import { GenderNumberManager, WithGender, WithNumber } from './GenderNumberManager';
import { agree as agreeFrenchAdj } from 'french-adjectives';
import { agreeGermanAdjective, DetTypes as GermanDetTypes } from 'german-adjectives';
import { agreeItalianAdjective } from 'italian-adjectives';
import { AdjectivesData } from 'rosaenlg-pug-code-gen';

import { Languages, Genders, GendersMF, Numbers, GermanCases } from './NlgLib';
import { AdjPos } from './ValueManager';
import { DetTypes } from './Determiner';

//import * as Debug from "debug";
//const debug = Debug("rosaenlg");

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
    const agreedAdj = this.getAgreeAdj(adjective, subject, params);
    this.spy.appendPugHtml(agreedAdj);

    if (this.language === 'it_IT' && agreedAdj.endsWith("'")) {
      // bell'uomo
      this.spy.appendPugHtml(' EATSPACE ');
    }

    this.spy.appendDoubleSpace();
  }

  public getAgreeAdj(adjective: string, subject: any, params: AgreeAdjParams): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_ADJ';
    } else {
      // debug(`getAgreeAdj ${adjective} ${JSON.stringify(subject)} ${JSON.stringify(params)}`);

      const gender: Genders = this.genderNumberManager.getRefGender(subject, params);
      const number: Numbers = this.genderNumberManager.getRefNumber(subject, params) || 'S';

      // debug('agreeAdj:' + ' gender=' + gender + ' number=' + number + ' / ' + adjective + ' / ' + JSON.stringify(subject).substring(0, 20) );

      switch (this.language) {
        case 'fr_FR':
          return agreeFrenchAdj(adjective, gender as GendersMF, number, subject, params && params.adjPos === 'BEFORE');
        case 'de_DE':
          return agreeGermanAdjective(
            adjective,
            params.case,
            gender,
            number,
            params.det as GermanDetTypes,
            this.embeddedAdjs,
          );
        case 'it_IT':
          return agreeItalianAdjective(
            adjective,
            gender as GendersMF,
            number,
            subject,
            params && params.adjPos === 'BEFORE',
            this.embeddedAdjs,
          );
        case 'en_US': // no agreement for adjectives in English
        default:
          return adjective;
      }
    }
  }
}
