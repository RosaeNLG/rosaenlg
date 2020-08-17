const GermanAdjectivesLib = require('./dist/index.js');
const GermanAdjectives = require('german-adjectives-dict');

// neuen
console.log(GermanAdjectivesLib.agreeGermanAdjective(null, GermanAdjectives, 'neu', 'DATIVE', 'M', 'S', 'DEFINITE'));
