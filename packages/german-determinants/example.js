var determinants = require('./dist/index.js');

// der
console.log( determinants.getDet('DEFINITE', 'NOMINATIVE', 'M', 'S') );

// dieser
console.log( determinants.getDet('DEMONSTRATIVE', 'GENITIVE', null, 'P') );

