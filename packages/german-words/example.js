var GermanWords = require('./dist/index.js');

// F
console.log( GermanWords.getGenderGermanWord('Gurke') );

// Herren
console.log( GermanWords.getCaseGermanWord('Herr', 'GENITIVE') );
