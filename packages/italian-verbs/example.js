const ItalianVerbs = require('./dist/index.js');
const ItalianVerbsList = require('italian-verbs-dict');

// mangia
console.log(ItalianVerbs.getConjugation(ItalianVerbsList, 'mangiare', 'PRESENTE', 3, 'S'));

// avevano mangiato
console.log(ItalianVerbs.getConjugation(ItalianVerbsList, 'mangiare', 'TRAPASSATO_PROSSIMO', 3, 'P', 'AVERE'));
