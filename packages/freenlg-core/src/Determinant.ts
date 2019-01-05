
import { getGenderFrenchWord } from "./FrenchWordsGender";

export function getDet(lang: string, det: string, obj: string, params: any): string {
  if (lang=='en_US') {
    return "TODO_DET_en_US";
  } else if (lang=='de_DE') {
    return "TODO_DET_de_DE";

  } else if (lang=='fr_FR') {
    var gender:string = getGenderFrenchWord(obj);
    if (gender==null) {
      console.log(`ERROR cannot put an article on ${obj}, gender is not in dict`);
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
