const SpanishVerbsWrapper = require('./dist/index.js');

// habla
console.log(SpanishVerbsWrapper.getConjugation(null, 'hablar', 'INDICATIVE_PRESENT', 'S'));

console.log(SpanishVerbsWrapper.getVerbInfo('hablar'));
