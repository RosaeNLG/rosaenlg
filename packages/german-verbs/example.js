var GermanVerbs = require('./dist/index.js');

// hörten
console.log(GermanVerbs.getConjugation('hören', 'PRATERITUM', 3, 'P'));

// werden gehabt haben
console.log(GermanVerbs.getConjugation('haben', 'FUTUR2', 3, 'P', 'HABEN'));
