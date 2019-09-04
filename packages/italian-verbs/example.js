var ItalianVerbs = require('./dist/index.js');

// mangia
console.log(ItalianVerbs.getConjugation('mangiare', 'PRESENTE', 3, 'S'));

// avevano mangiato
console.log(ItalianVerbs.getConjugation('mangiare', 'TRAPASSATO_PROSSIMO', 3, 'P', 'AVERE'));
