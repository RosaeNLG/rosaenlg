const GermanWords = require('./dist/index.js');
const GermanWordsList = require('german-words-dict');

// F
console.log(GermanWords.getGenderGermanWord(null, GermanWordsList, 'Gurke'));

// Herren
console.log(GermanWords.getCaseGermanWord(null, GermanWordsList, 'Herr', 'GENITIVE', 'S'));

// Gurken
console.log(GermanWords.getCaseGermanWord(null, GermanWordsList, 'Gurke', 'NOMINATIVE', 'P'));
