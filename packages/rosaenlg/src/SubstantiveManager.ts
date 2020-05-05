import { Languages, Numbers, GermanCases } from './NlgLib';
import { WordsData } from 'rosaenlg-pug-code-gen';
// de_DE
import { getCaseGermanWord } from 'german-words';
import germanWordsDict from 'german-words-dict';
// it_IT
import { getNumberItalianWord } from 'italian-words';
import italianWordsDict from 'italian-words-dict';
// en_US
import englishPluralsList from 'english-plurals-list';
import { getPlural as getEnglishPlural } from 'english-plurals';
// fr_FR
import { getPlural as getFrenchPlural } from 'french-words';
// es_ES
import { getPluralSpanishWord } from 'spanish-words';

export class SubstantiveManager {
  private language: Languages;
  // private spy: Spy;

  private embeddedWords: WordsData;

  public constructor(language: Languages) {
    this.language = language;
  }

  /*
  public setSpy(spy: Spy): void {
    this.spy = spy;
  }
  */
  public setEmbeddedWords(embeddedWords: WordsData): void {
    this.embeddedWords = embeddedWords;
  }

  public getSubstantive(subst: string, number: Numbers, germanCase: GermanCases): string {
    // manage simple cases
    if (number === 'S' && ((this.language === 'de_DE' && germanCase === 'NOMINATIVE') || this.language != 'de_DE')) {
      return subst;
    }

    switch (this.language) {
      case 'en_US':
        return getEnglishPlural(this.embeddedWords || englishPluralsList, subst);
      case 'de_DE':
        return getCaseGermanWord(this.embeddedWords || germanWordsDict, subst, germanCase, number);
      case 'fr_FR':
        return getFrenchPlural(this.embeddedWords, subst);
      case 'it_IT':
        return getNumberItalianWord(this.embeddedWords || italianWordsDict, subst, number);
      case 'es_ES':
        return getPluralSpanishWord(this.embeddedWords, subst);
      default: {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `cannot make plural of word ${subst} in ${this.language}`;
        throw err;
      }
    }
  }
}
