const GermanAdjectivesLib = require('./dist/index.js');
const GermanAdjectives = require('german-adjectives-dict');

// neuen
console.log(GermanAdjectivesLib.agreeGermanAdjective(GermanAdjectives, 'neu', 'DATIVE', 'M', 'S', 'DEFINITE'));
