const FrenchWordsLib = require('./dist/index.js');
const FrenchWordsLefff = require('french-words-gender-lefff');

// M
console.log(FrenchWordsLib.getGenderFrenchWord(FrenchWordsLefff, 'déjeuner'));

// F
console.log(FrenchWordsLib.getGenderFrenchWord(FrenchWordsLefff, 'Console'));
