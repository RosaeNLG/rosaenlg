const ItalianWords = require('./dist/index.js');
const ItalianWordsList = require('italian-words-dict');

// F
console.log(ItalianWords.getGenderItalianWord(null, ItalianWordsList, 'cameriera'));

// libri
console.log(ItalianWords.getNumberItalianWord(null, ItalianWordsList, 'libro', 'P'));

// arance
console.log(ItalianWords.getNumberItalianWord(null, ItalianWordsList, 'arancia', 'P'));
