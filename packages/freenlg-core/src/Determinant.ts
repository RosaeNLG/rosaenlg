
import { getGenderFrenchWord } from "./FrenchWordsGender";
import { getGenderGermanWord } from "./GermanWordsGenderCases";

export function getDet(lang: string, det: string, obj: string, params: any): string {
  if (lang=='en_US') {
    return "TODO_DET_en_US";

  } else if (lang=='de_DE') {
    var gender:string = getGenderGermanWord(obj);
    if (gender==null) {
      console.log(`ERROR cannot put an article on ${obj}, gender is not in German dict`);
      return '';
    }
    // console.log(gender);
    var res: string = '';
    switch(det) {
      case 'DEFINITE':
        switch(gender) {
          case 'M':
            res = 'der';
            break;
          case 'F':
            res = 'die';
            break;
          case 'N':
            res = 'das';
            break;
        }
        break;
      default:
        console.log(`ERROR ${det} is not supported in de_DE`);
    }
    return `${res} `;

    
  } else if (lang=='fr_FR') {
    var gender:string = getGenderFrenchWord(obj);
    if (gender==null) {
      console.log(`ERROR cannot put an article on ${obj}, gender is not in French dict`);
      return '';
    }
    var res: string = '';
    switch(det) {
      case 'DEFINITE':
        res = gender=='M' ? 'le':'la';
        break;
      case 'DEMONSTRATIVE':
        res = gender=='M' ? 'ce':'cette';
        break;
      default:
        console.log(`ERROR ${det} is not supported in fr_FR`);
    }
    return `${res} `;
  }
}
