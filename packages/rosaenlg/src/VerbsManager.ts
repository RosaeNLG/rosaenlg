import { GenderNumberManager } from './GenderNumberManager';
import { getConjugation as libGetConjugationFr, FrenchTense, FrenchAux } from 'french-verbs';
import { getConjugation as libGetConjugationDe, GermanTense, GermanAux, PronominalCase } from 'german-verbs';
import { getConjugation as libGetConjugationIt, ItalianTense, ItalianAux } from 'italian-verbs';
import { Languages, Numbers, GendersMF } from './NlgLib';
import { VerbsData } from 'rosaenlg-pug-code-gen';

import * as compromise from 'compromise';

//import * as Debug from "debug";
//const debug = Debug("rosaenlg");

type EnglishTense = 'PRESENT' | 'PAST' | 'FUTURE';

type Tense = GermanTense | FrenchTense | EnglishTense | ItalianTense;

interface ConjParams {
  verb: string;
  pronominal: boolean;
  tense: Tense;
}
interface ConjParamsDe extends ConjParams {
  tense: GermanTense;
  pronominalCase: PronominalCase;
  aux: GermanAux;
}
interface ConjParamsFr extends ConjParams {
  tense: FrenchTense;
  agree: any;
  aux: FrenchAux;
}
interface ConjParamsEn extends ConjParams {
  tense: EnglishTense;
}
interface ConjParamsIt extends ConjParams {
  tense: ItalianTense;
  agree: any;
  aux: ItalianAux;
}

export type VerbParts = string[];

export class VerbsManager {
  private language: Languages;
  private genderNumberManager: GenderNumberManager;
  private spy: Spy;
  private embeddedVerbs: VerbsData;
  private verbParts: VerbParts;

  public constructor(language: Languages, genderNumberManager: GenderNumberManager) {
    this.language = language;
    this.genderNumberManager = genderNumberManager;
    this.verbParts = [];
  }

  public getVerbPartsList(): VerbParts {
    return this.verbParts;
  }
  public setVerbPartsList(verbParts: VerbParts): void {
    this.verbParts = verbParts;
  }

  public setEmbeddedVerbs(embeddedVerbs: VerbsData): void {
    this.embeddedVerbs = embeddedVerbs;
  }

  public setSpy(spy: Spy): void {
    this.spy = spy;
  }
  public getAgreeVerb(subject: any, conjParams: string | ConjParams): string {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_VERB';
    } else {
      const verbName: string = typeof conjParams === 'string' ? conjParams : conjParams.verb;
      if (!verbName) {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `verb needed`;
        throw err;
      }

      let tense: Tense;
      if (conjParams && (conjParams as ConjParams).tense) {
        tense = (conjParams as ConjParams).tense;
      } else {
        const defaultTenses = {
          en_US: 'PRESENT', // eslint-disable-line
          fr_FR: 'PRESENT', // eslint-disable-line
          de_DE: 'PRASENS', // eslint-disable-line
          it_IT: 'PRESENTE', // eslint-disable-line
        };
        tense = defaultTenses[this.language] as Tense;
      }

      const number: 'S' | 'P' = this.genderNumberManager.getRefNumber(subject, null) || 'S';
      //console.log(`${this.language} ${JSON.stringify(subject)} > ${number}`);

      // debug('verb=' + verbName + ' tense=' + tense + ' params: ' + JSON.stringify(ConjParams));

      const leftParams = typeof conjParams === 'string' ? null : conjParams;
      switch (this.language) {
        case 'en_US':
          return this.getConjugationEn(verbName, tense as EnglishTense, number);
        case 'fr_FR':
          return this.getConjugationFr(verbName, tense as FrenchTense, number, leftParams as ConjParamsFr);
        case 'de_DE':
          return this.getConjugationDe(verbName, tense as GermanTense, number, leftParams as ConjParamsDe);
        case 'it_IT':
          return this.getConjugationIt(verbName, tense as ItalianTense, number, leftParams as ConjParamsIt);
        default:
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `verbs not available in ${this.language}`;
          throw err;
      }
    }
  }

  public popVerbPart(): string {
    if (this.language != 'de_DE') {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart is only meaningful for de_DE language, not for ${this.language}`;
      throw err;
    }

    const verb: string = this.verbParts.pop();
    if (!verb) {
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `verbPart nothing to pop`;
      throw err;
    }
    return verb;
  }

  private getConjugationDe(verb: string, tense: GermanTense, number: Numbers, conjParams: ConjParamsDe): string {
    const tensesWithParts: string[] = [
      'FUTUR1',
      'FUTUR2',
      'PERFEKT',
      'PLUSQUAMPERFEKT',
      'KONJUNKTIV1_FUTUR1',
      'KONJUNKTIV1_PERFEKT',
      'KONJUNKTIV2_FUTUR1',
      'KONJUNKTIV2_FUTUR2',
    ];

    let pronominal = false;
    let pronominalCase: PronominalCase;
    if (conjParams && conjParams.pronominal) {
      pronominal = true;
      pronominalCase = conjParams.pronominalCase;
    }

    //console.log('before calling libGetConjugationDe: ' + number);
    if (tensesWithParts.indexOf(tense) > -1) {
      // 'wird sein'

      // istanbul ignore next
      const aux: 'SEIN' | 'HABEN' = conjParams ? conjParams.aux : null;
      const conjElts: string[] = libGetConjugationDe(
        verb,
        tense as GermanTense,
        3,
        number,
        aux,
        pronominal,
        pronominalCase,
        this.embeddedVerbs,
      );
      this.verbParts.push(conjElts.slice(1).join(' ')); // FUTUR2: 'wird gedacht haben'
      return conjElts[0];
    } else {
      return libGetConjugationDe(
        verb,
        tense as GermanTense,
        3,
        number,
        null,
        pronominal,
        pronominalCase,
        this.embeddedVerbs,
      ).join(' ');
    }
  }

  private getConjugationFr(verb: string, tense: FrenchTense, number: Numbers, conjParams: ConjParamsFr): string {
    let person;
    if (number === 'P') {
      person = 5;
    } else {
      person = 2;
    }

    let pronominal: boolean;
    if (conjParams && conjParams.pronominal) {
      pronominal = true;
    }
    let aux: FrenchAux;
    if (conjParams && conjParams.aux) {
      aux = conjParams.aux;
    }
    let agreeGender: GendersMF;
    let agreeNumber: Numbers;
    if (conjParams && conjParams.agree) {
      agreeGender = this.genderNumberManager.getRefGender(conjParams.agree, null) as GendersMF;
      agreeNumber = this.genderNumberManager.getRefNumber(conjParams.agree, null);
    }

    // also give the verbs that we embedded in the compiled template, if there are some
    const verbsSpecificList: VerbsData = this.embeddedVerbs;
    //console.log(`verbsSpecificList: ${JSON.stringify(params.verbsSpecificList)}`);

    return libGetConjugationFr(verb, tense, person, aux, agreeGender, agreeNumber, pronominal, verbsSpecificList);
  }

  private getConjugationIt(verb: string, tense: ItalianTense, number: Numbers, conjParams: ConjParamsIt): string {
    let aux: ItalianAux;
    if (conjParams && conjParams.aux) {
      aux = conjParams.aux;
    }
    let agreeGender: GendersMF;
    let agreeNumber: Numbers;
    if (conjParams && conjParams.agree) {
      agreeGender = this.genderNumberManager.getRefGender(conjParams.agree, null) as GendersMF;
      agreeNumber = this.genderNumberManager.getRefNumber(conjParams.agree, null);
    }

    // also give the verbs that we embedded in the compiled template, if there are some
    const verbsSpecificList: VerbsData = this.embeddedVerbs;
    //console.log(`verbsSpecificList: ${JSON.stringify(params.verbsSpecificList)}`);

    return libGetConjugationIt(verb, tense, 3, number, aux, agreeGender, agreeNumber, verbsSpecificList);
  }
  private getConjugationEn(verb: string, tense: EnglishTense, number: Numbers): string {
    // debug( compromise(verb).verbs().conjugate() );
    // console.log('TENSE: ' + tense);
    // console.log( compromise('he ' + verb).verbs().conjugate()[0]['PresentTense'] );

    if (tense === 'PRESENT' && number === 'P') {
      return verb;
    }

    const tenseMapping = {
      PRESENT: 'PresentTense',
      PAST: 'PastTense',
      FUTURE: 'FutureTense',
    };

    const conjugated: any[] = compromise('he ' + verb)
      .verbs()
      .conjugate();
    /* istanbul ignore else  */
    if (conjugated.length > 0) {
      return conjugated[0][tenseMapping[tense]];
    } else {
      return null;
    }
  }
}
