const FrenchWordsLib = require('./dist/index.js');
const FrenchWordsLefff = require('french-words-gender-lefff');

// M
console.log(FrenchWordsLib.getGender(null, FrenchWordsLefff, 'déjeuner'));

// F
console.log(FrenchWordsLib.getGender(null, FrenchWordsLefff, 'Console'));

// genoux
console.log(FrenchWordsLib.getPlural(null, 'genou'));
