import { GenderNumberManager } from './GenderNumberManager';
import { RefsManager, NextRef } from './RefsManager';
import { Helper } from './Helper';
import { getCaseGermanWord } from 'german-words';
import germanWordsDict from 'german-words-dict';
import { getDet } from './Determiner';
import { Languages } from './NlgLib';
import { WordsData } from 'rosaenlg-pug-code-gen';

// import * as Debug from 'debug';
// const debug = Debug('rosaenlg');

export type PossForm = 'OF' | 'S';

export class PossessiveManager {
  private language: Languages;
  private genderNumberManager: GenderNumberManager;
  private refsManager: RefsManager;
  private helper: Helper;
  private spy: Spy;
  private embeddedWords: WordsData;

  public constructor(
    language: Languages,
    genderNumberManager: GenderNumberManager,
    refsManager: RefsManager,
    helper: Helper,
  ) {
    this.language = language;
    this.genderNumberManager = genderNumberManager;
    this.refsManager = refsManager;
    this.helper = helper;
  }
  public setSpy(spy: Spy): void {
    this.spy = spy;
  }
  public setEmbeddedWords(embeddedWords: WordsData): void {
    this.embeddedWords = embeddedWords;
  }

  /*
    still very partial
  */
  public recipientPossession(owned: any): void {
    switch (this.language) {
      case 'en_US': {
        this.spy.appendPugHtml('your');
        this.spy.getPugMixins().value(owned, { _OWNER: true });
        break;
      }

      case 'fr_FR': {
        const nextRef: NextRef = this.refsManager.getNextRep(owned, { _OWNER: true });
        /* debug(`nextRef: 
                gender=${this.genderNumberManager.getRefGender(nextRef, null)} 
                number=${this.genderNumberManager.getRefNumber(nextRef, null)}`);
        */

        // vos / votre + value of the object
        this.spy.appendPugHtml(`${this.helper.getSorP(['votre', 'vos'], nextRef)} `);
        this.spy.getPugMixins().value(owned, { _OWNER: true });
        break;
      }

      default: {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `recipientPossession not implemented in ${this.language}`;
        throw err;
      }
    }
  }

  private thirdPossessionRefTriggeredFr(owner: any, owned: any, params: any): void {
    const det: string = getDet(this.language, 'POSSESSIVE', {
      genderOwned: this.genderNumberManager.getRefGender(owned, null),
      genderOwner: null,
      numberOwner: this.genderNumberManager.getRefNumber(owner, params),
      numberOwned: this.genderNumberManager.getRefNumber(owned, params),
      case: null,
      dist: null,
    });

    this.spy.appendPugHtml(` ${det} ${owned} `);
  }

  private thirdPossessionRefTriggeredEn(owner: any, owned: any, params: any): void {
    const det: string = getDet(this.language, 'POSSESSIVE', {
      genderOwned: null,
      genderOwner: this.genderNumberManager.getRefGender(owner, params),
      numberOwner: this.genderNumberManager.getRefNumber(owner, params),
      numberOwned: null, // we do not care
      case: null,
      dist: null,
    });

    this.spy.appendPugHtml(` ${det} ${owned} `);
  }

  private thirdPossessionRefTriggeredDe(owner: any, owned: any, params: any): void {
    const germanCase: 'NOMINATIVE' | 'ACCUSATIVE' | 'DATIVE' | 'GENITIVE' =
      params && params.case ? params.case : 'NOMINATIVE';

    // debug(`${owner} ${owned}`);
    //console.log(`thirdPossessionRefTriggeredDe ${JSON.stringify(owner)}`);

    //console.log(`thirdPossessionRefTriggeredDe ${number}`);

    const det: string = getDet(this.language, 'POSSESSIVE', {
      genderOwner: this.genderNumberManager.getRefGender(owner, params),
      numberOwner: this.genderNumberManager.getRefNumber(owner, params),
      genderOwned: this.genderNumberManager.getRefGender(owned, params),
      numberOwned: this.genderNumberManager.getRefNumber(owned, params),
      case: germanCase,
      dist: null,
    });

    /*
      3. décliner le mot
      getCaseGermanWord always returns something (not null)
      UNSURE ABOUT numberOwned / owner?
    */
    const declinedWord: string = getCaseGermanWord(
      this.embeddedWords || germanWordsDict,
      owned,
      germanCase,
      this.genderNumberManager.getRefNumber(owner, params) || 'S',
    );

    this.spy.appendPugHtml(` ${det} ${declinedWord} `);
  }

  private thirdPossessionTriggerRefFr(owner: any, owned: any, params: any): void {
    this.spy.getPugMixins().value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
    this.spy.appendPugHtml(` de `);
    this.spy.getPugMixins().value(owner, Object.assign({}, params));
  }

  private thirdPossessionTriggerRefEn(
    owner: any,
    owned: any,
    params: {
      possForm: PossForm;
    },
  ): void {
    let possForm: PossForm;
    if (params && params.possForm) {
      if (params.possForm === 'OF' || params.possForm === 'S') {
        possForm = params.possForm;
      } else {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `possForm must be either OF or S`;
        throw err;
      }
    } else {
      possForm = 'OF';
    }

    switch (possForm) {
      case 'OF': {
        this.spy.getPugMixins().value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
        this.spy.appendPugHtml(` of `);
        this.spy.getPugMixins().value(owner, Object.assign({}, params));
        break;
      }
      case 'S': {
        this.spy.getPugMixins().value(owner, Object.assign({}, params));
        this.spy.appendPugHtml(`'s`);
        this.spy.getPugMixins().value(owned, Object.assign({}, params));
        break;
      }
    }
  }

  private thirdPossessionTriggerRefDe(owner: any, owned: any, params: any): void {
    this.spy.getPugMixins().value(owned, Object.assign({}, params, { det: 'DEFINITE' }));
    this.spy.appendDoubleSpace();
    this.spy.getPugMixins().value(owner, Object.assign({}, params, { case: 'GENITIVE' }));
  }

  public thirdPossession(owner: any, owned: any, params: any): void {
    this.spy.appendDoubleSpace();

    // on a besoin de savoir si ça va être ref ou ana, mais aussi le genre, le nombre...
    const nextRef: NextRef = this.refsManager.getNextRep(owner, params);

    /* debug(`nextRef: 
            gender=${this.genderNumberManager.getRefGender(nextRef, null)} 
            number=${this.genderNumberManager.getRefNumber(nextRef, null)}
            REPRESENTANT=${nextRef.REPRESENTANT}`);
    */

    /* istanbul ignore if */
    if (nextRef.REPRESENTANT != 'ref' && nextRef.REPRESENTANT != 'refexpr') {
      const err = new Error();
      err.name = '';
      err.message = `internal pb on thirdPossession: ${JSON.stringify(nextRef)}`;
      throw err;
    }

    if (!['en_US', 'fr_FR', 'de_DE'].includes(this.language)) {
      // not in it_IT and not in other languages
      const err = new Error();
      err.name = 'InvalidArgumentError';
      err.message = `thirdPossession not available in ${this.language}`;
      throw err;
    }

    switch (nextRef.REPRESENTANT) {
      case 'ref': {
        // ref not triggered, thus we will have to do it
        switch (this.language) {
          case 'en_US':
            this.thirdPossessionTriggerRefEn(owner, owned, params);
            break;
          case 'fr_FR':
            this.thirdPossessionTriggerRefFr(owner, owned, params);
            break;
          case 'de_DE':
            this.thirdPossessionTriggerRefDe(owner, owned, params);
            break;
        }
        break;
      }
      case 'refexpr': {
        // ref was already triggered, we only have to manage the possessive
        switch (this.language) {
          case 'en_US':
            this.thirdPossessionRefTriggeredEn(owner, owned, params);
            break;
          case 'fr_FR':
            this.thirdPossessionRefTriggeredFr(owner, owned, params);
            break;
          case 'de_DE':
            this.thirdPossessionRefTriggeredDe(owner, owned, params);
            break;
        }
        break;
      }
    }

    this.spy.appendDoubleSpace();
  }
}
