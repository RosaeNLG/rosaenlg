const GermanWords = require('./dist/index.js');

// F
console.log(GermanWords.getGenderGermanWord('Gurke'));

// Herren
console.log(GermanWords.getCaseGermanWord('Herr', 'GENITIVE', 'S'));

// Gurken
console.log(GermanWords.getCaseGermanWord('Gurke', 'NOMINATIVE', 'P'));
