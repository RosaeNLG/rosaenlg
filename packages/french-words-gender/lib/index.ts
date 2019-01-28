import fs = require('fs');

let wordsWithGender: any;

export function getGenderFrenchWord(word: string): 'M'|'F' {
  // lazy loading
  if (wordsWithGender!=null) {
    // console.log('DID NOT RELOAD');
  } else {
    // console.log('LOAD');
    wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/wordsWithGender.json', 'utf8'));
  }

  return wordsWithGender[word.toLowerCase()];

}
