const SpanishVerbs = require('./dist/index.js');

// habla
console.log(SpanishVerbs.getConjugation('hablar', 'INDICATIVE_PRESENT', 2));

console.log(JSON.stringify(SpanishVerbs.getVerbInfo('escribir')));
