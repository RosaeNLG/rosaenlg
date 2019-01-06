import fs = require('fs');

let wordsWithGender: any;

export function getGenderGermanWord(word: string): string {
  // lazy loading
  if (wordsWithGender!=null) {
    // console.log('DID NOT RELOAD');
  } else {
    // console.log('LOAD');
    wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/de_DE/wordsWithGender.json', 'utf8'));
  }

  var wordInfo = wordsWithGender[word];
  if (wordInfo==null) {
    console.log(`ERROR ${word} is not in German dict`);
    return null;
  }

  return wordInfo['G'];

}
