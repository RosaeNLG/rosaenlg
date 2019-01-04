import fs = require('fs');

let wordsWithGender: any;

export class FrenchWordsGender {

  wordsWithGender: any;

  constructor() {
  
    if (wordsWithGender!=null) {
      // console.log('DID NOT RELOAD');
      this.wordsWithGender = wordsWithGender;
    } else {
      // console.log('LOAD');
      this.wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/fr_FR/wordsWithGender.json', 'utf8'));
      wordsWithGender = this.wordsWithGender;
    }
  }

  getGender(word: string): string {
    // console.log("XXXXX getGender " + word);

    return this.wordsWithGender[word];
  }

}
