import { Constants } from './constants';

export function isConsonneImpure(word: string, constants: Constants): boolean {
  const wordLc = word.toLowerCase();

  const begins = ['ps', 'pn', 'gn', 'x', 'z'];
  for (let i = 0; i < begins.length; i++) {
    //console.log(`${word} start with ${begins[i]}?`);
    if (wordLc.startsWith(begins[i])) {
      //console.log(`isConsonneImpure ${word}? => true`);
      return true;
    }
  }
  // s impur (autrement dit un s suivi d'une autre consonne)
  const regexSImpur = new RegExp('^s[' + constants.toutesConsonnes + ']');
  if (regexSImpur.test(wordLc)) {
    //console.log(`isConsonneImpure ${word}? => true`);
    return true;
  }
  //console.log(`isConsonneImpure ${word}? => false`);
  return false;
}

export function isIFollowedByVowel(word: string, constants: Constants): boolean {
  const regexISuiviVoyelle = new RegExp('^[IiYy][' + constants.toutesVoyellesMinuscules + ']');
  if (regexISuiviVoyelle.test(word)) {
    return true;
  }
  return false;
}

export function startsWithVowel(word: string, constants: Constants): boolean {
  const regexVowel = new RegExp('^[' + constants.toutesVoyellesMinuscules + ']');
  if (regexVowel.test(word.toLowerCase())) {
    return true;
  }
  return false;
}
