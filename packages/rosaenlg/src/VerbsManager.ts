import { GenderNumberManager } from './GenderNumberManager';
import { SynManager } from './SynManager';

// fr_FR
import { getConjugation as libGetConjugationFr, FrenchTense, FrenchAux, alwaysAuxEtre } from 'french-verbs';
import frenchVerbsDict from 'french-verbs-lefff';
// de_DE
import { getConjugation as libGetConjugationDe, GermanTense, GermanAux, PronominalCase } from 'german-verbs';
import germanVerbsDict from 'german-verbs-dict';
// it_IT
import { getConjugation as libGetConjugationIt, ItalianTense, ItalianAux } from 'italian-verbs';
import italianVerbsDict from 'italian-verbs-dict';
// es_ES
import { SpanishTense, getConjugation as libGetConjugationEs } from 'spanish-verbs-wrapper';

import { Languages, Numbers, GendersMF } from './NlgLib';
import { VerbsData } from 'rosaenlg-pug-code-gen';
import {
  EnglishTense,
  getConjugation as libGetConjugationEn,
  ExtraParams as ExtraParamsEn,
  mergeVerbsData as mergeVerbsDataEn,
  VerbsInfo,
} from 'english-verbs-helper';
import englishVerbsIrregular from 'english-verbs-irregular';
import englishVerbsGerunds from 'english-verbs-gerunds';

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
interface ConjParamsEn extends ConjParams, ExtraParamsEn {
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
  private synManager: SynManager;
  private spy: Spy;

  private embeddedVerbs: VerbsData;
  private verbParts: VerbParts;
  private mergedVerbsDataEn: VerbsInfo;

  public constructor(language: Languages, genderNumberManager: GenderNumberManager, synManager: SynManager) {
    this.language = language;
    this.genderNumberManager = genderNumberManager;
    this.synManager = synManager;

    this.verbParts = [];

    // create English combined resource
    if (this.language === 'en_US') {
      this.mergedVerbsDataEn = mergeVerbsDataEn(englishVerbsIrregular, englishVerbsGerunds);
    }
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
      let verbName: string;
      if (typeof conjParams === 'object' && !Array.isArray(conjParams)) {
        // in .verb prop
        verbName = this.synManager.synFctHelper(conjParams.verb);
      } else {
        // direct arg: string or array
        verbName = this.synManager.synFctHelper(conjParams);
      }

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
          es_ES: 'INDICATIVE_PRESENT', // eslint-disable-line
        };
        tense = defaultTenses[this.language] as Tense;
      }

      const number: 'S' | 'P' = this.genderNumberManager.getRefNumber(subject, null) || 'S';
      //console.log(`${this.language} ${JSON.stringify(subject)} > ${number}`);

      // console.log('verb=' + verbName + ' tense=' + tense + ' params: ' + JSON.stringify(ConjParams));

      const leftParams = typeof conjParams === 'string' ? null : conjParams;
      switch (this.language) {
        case 'en_US':
          return this.getConjugationEn(verbName, tense as EnglishTense, number, leftParams as ConjParamsEn);
        case 'fr_FR':
          return this.getConjugationFr(subject, verbName, tense as FrenchTense, number, leftParams as ConjParamsFr);
        case 'de_DE':
          return this.getConjugationDe(verbName, tense as GermanTense, number, leftParams as ConjParamsDe);
        case 'it_IT':
          return this.getConjugationIt(verbName, tense as ItalianTense, number, leftParams as ConjParamsIt);
        case 'es_ES':
          return this.getConjugationEs(verbName, tense as SpanishTense, number);
        default: {
          const err = new Error();
          err.name = 'InvalidArgumentError';
          err.message = `verbs not available in ${this.language}`;
          throw err;
        }
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
        this.embeddedVerbs || germanVerbsDict,
        verb,
        tense, // as GermanTense
        3,
        number,
        aux,
        pronominal,
        pronominalCase,
      );
      this.verbParts.push(conjElts.slice(1).join('¤')); // FUTUR2: 'wird gedacht haben'
      return conjElts[0];
    } else {
      return libGetConjugationDe(
        this.embeddedVerbs || germanVerbsDict,
        verb,
        tense, // as GermanTense
        3,
        number,
        null,
        pronominal,
        pronominalCase,
      ).join('¤');
    }
  }

  private getConjugationFr(
    subject: any,
    verb: string,
    tense: FrenchTense,
    number: Numbers,
    conjParams: ConjParamsFr,
  ): string {
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
    } else if (tense === 'PASSE_COMPOSE' || tense === 'PLUS_QUE_PARFAIT') {
      // no explicit "agree" param, but aux is ETRE, either clearly stated or is default,
      // then agreement of the participle must be automatic
      if (aux === 'ETRE' || alwaysAuxEtre(verb)) {
        agreeGender = this.genderNumberManager.getRefGender(subject, null) as GendersMF;
        agreeNumber = this.genderNumberManager.getRefNumber(subject, null);
      }
    }

    // also give the verbs that we embedded in the compiled template, if there are some
    const verbsSpecificList: VerbsData = this.embeddedVerbs;
    //console.log(`verbsSpecificList: ${JSON.stringify(params.verbsSpecificList)}`);

    return libGetConjugationFr(
      verbsSpecificList || frenchVerbsDict, // if nothing we use the lefff
      verb,
      tense,
      person,
      aux,
      agreeGender,
      agreeNumber,
      pronominal,
    );
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

    return libGetConjugationIt(
      verbsSpecificList || italianVerbsDict,
      verb,
      tense,
      3,
      number,
      aux,
      agreeGender,
      agreeNumber,
    );
  }
  private getConjugationEn(verb: string, tense: EnglishTense, number: Numbers, leftParams: ConjParamsEn): string {
    const verbsSpecificList: VerbsData = this.embeddedVerbs;
    return libGetConjugationEn(verbsSpecificList || this.mergedVerbsDataEn, verb, tense, number, leftParams);
  }
  private getConjugationEs(verb: string, tense: SpanishTense, number: Numbers): string {
    const verbsSpecificList: VerbsData = this.embeddedVerbs;
    // one of verbsSpecificList and conjFctEs is always null: it's one or the other
    return libGetConjugationEs(verbsSpecificList, verb, tense, number);
  }
}
