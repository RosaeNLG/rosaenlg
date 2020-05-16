import { GenderNumberManager, WithGender, WithNumber } from './GenderNumberManager';
import { SynManager } from './SynManager';
import { AdjectivesData } from 'rosaenlg-pug-code-gen';
import { EATSPACE } from 'rosaenlg-filter';
import { Languages, Genders, GendersMF, Numbers, GermanCases } from './NlgLib';
import { AdjPos } from './ValueManager';
import { DetTypes } from './Determiner';

// fr_FR
import { agreeAdjective as agreeFrenchAdj } from 'french-adjectives-wrapper';
// de_DE
import { agreeGermanAdjective, DetTypes as GermanDetTypes } from 'german-adjectives';
import germanAdjectivesDict from 'german-adjectives-dict';
// it_IT
import { agreeItalianAdjective } from 'italian-adjectives';
import italianAdjectivesDict from 'italian-adjectives-dict';
// es_ES
import { agreeAdjective as agreeSpanishAdjective } from 'spanish-adjectives-wrapper';

export type Adjective = string | string[];

interface AgreeAdjParams extends WithGender, WithNumber {
  adjPos: AdjPos;
  case: GermanCases;
  det: DetTypes;
}

export class AdjectiveManager {
  private language: Languages;
  private genderNumberManager: GenderNumberManager;
  private synManager: SynManager;

  private spy: Spy;
  private embeddedAdjs: AdjectivesData;

  public setSpy(spy: Spy): void {
    this.spy = spy;
  }

  public setEmbeddedAdj(embeddedAdjs: AdjectivesData): void {
    this.embeddedAdjs = embeddedAdjs;
  }

  public constructor(language: Languages, genderNumberManager: GenderNumberManager, synManager: SynManager) {
    this.language = language;
    this.genderNumberManager = genderNumberManager;
    this.synManager = synManager;
  }

  // when using the mixin
  public agreeAdj(adjective: Adjective, subject: any, params: any): void {
    if (this.spy.isEvaluatingEmpty()) {
      this.spy.appendPugHtml('SOME_ADJ'); // as is called directly through a mixin
    } else {
      // console.log('adj: ' + JSON.stringify(adjective));

      this.spy.appendDoubleSpace();

      const adj: string = this.synManager.synFctHelper(adjective);

      const agreedAdj = this.getAgreeAdj(adj, subject, params);
      this.spy.appendPugHtml(agreedAdj);

      if (this.language === 'it_IT' && agreedAdj.endsWith("'")) {
        // bell'uomo
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

    // console.log('agreeAdj:' + ' gender=' + gender + ' number=' + number + ' / ' + adjective + ' / ' + JSON.stringify(subject).substring(0, 20) );

    switch (this.language) {
      case 'fr_FR':
        return agreeFrenchAdj(
          this.embeddedAdjs,
          adjective,
          gender as GendersMF,
          number,
          subject,
          params && params.adjPos === 'BEFORE',
        );
      case 'de_DE':
        return agreeGermanAdjective(
          this.embeddedAdjs || germanAdjectivesDict,
          adjective,
          params.case,
          gender,
          number,
          params.det as GermanDetTypes,
        );
      case 'it_IT':
        return agreeItalianAdjective(
          this.embeddedAdjs || italianAdjectivesDict,
          adjective,
          gender as GendersMF,
          number,
          subject,
          params && params.adjPos === 'BEFORE',
        );
      case 'es_ES':
        return agreeSpanishAdjective(
          this.embeddedAdjs,
          adjective,
          gender as GendersMF,
          number,
          params && params.adjPos === 'BEFORE' ? true : false,
        );
      case 'en_US': // no agreement for adjectives in English
      default:
        return adjective;
    }
  }
}
