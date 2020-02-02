const GermanWords = require('./dist/index.js');
const GermanWordsList = require('german-words-dict');

// F
console.log(GermanWords.getGenderGermanWord(GermanWordsList, 'Gurke'));

// Herren
console.log(GermanWords.getCaseGermanWord(GermanWordsList, 'Herr', 'GENITIVE', 'S'));

// Gurken
console.log(GermanWords.getCaseGermanWord(GermanWordsList, 'Gurke', 'NOMINATIVE', 'P'));
