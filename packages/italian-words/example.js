const ItalianWords = require('./dist/index.js');
const ItalianWordsList = require('italian-words-dict');

// F
console.log(ItalianWords.getGenderItalianWord(ItalianWordsList, 'cameriera'));

// libri
console.log(ItalianWords.getNumberItalianWord(ItalianWordsList, 'libro', 'P'));

// arance
console.log(ItalianWords.getNumberItalianWord(ItalianWordsList, 'arancia', 'P'));
