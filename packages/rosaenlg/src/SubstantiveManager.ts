import { Languages, Numbers, GermanCases } from './NlgLib';
import { DictManager } from 'rosaenlg-commons';

// de_DE
import { getCaseGermanWord, WordsInfo as GermanWordsInfo } from 'german-words';
import germanWordsDict from 'german-words-dict';
// it_IT
import { getNumberItalianWord, WordsInfo as ItalianWordsInfo } from 'italian-words';
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
  private dictManager: DictManager;

  public constructor(language: Languages, dictManager: DictManager) {
    this.language = language;
    this.dictManager = dictManager;
  }

  public getSubstantive(subst: string, number: Numbers, germanCase: GermanCases): string {
    // manage simple cases
    if (number === 'S' && ((this.language === 'de_DE' && germanCase === 'NOMINATIVE') || this.language != 'de_DE')) {
      return subst;
    }

    const wordsData = this.dictManager.getWordData();

    switch (this.language) {
      case 'en_US':
        return getEnglishPlural(wordsData, englishPluralsList, subst);
      case 'de_DE':
        return getCaseGermanWord(wordsData, germanWordsDict as GermanWordsInfo, subst, germanCase, number); //NOSONAR
      case 'fr_FR':
        return getFrenchPlural(wordsData, subst);
      case 'it_IT':
        return getNumberItalianWord(wordsData, italianWordsDict as ItalianWordsInfo, subst, number); //NOSONAR
      case 'es_ES':
        return getPluralSpanishWord(wordsData, subst);
      default: {
        const err = new Error();
        err.name = 'InvalidArgumentError';
        err.message = `cannot make plural of word ${subst} in ${this.language}`;
        throw err;
      }
    }
  }
}
