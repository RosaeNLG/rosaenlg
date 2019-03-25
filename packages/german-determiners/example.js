var determiners = require('./dist/index.js');

// der
console.log( determiners.getDet('DEFINITE', 'NOMINATIVE', null, 'M', 'S') );

// dieser
console.log( determiners.getDet('DEMONSTRATIVE', 'GENITIVE', null, null, 'P') );

// ihres
console.log( determiners.getDet('POSSESSIVE', 'GENITIVE', 'F', 'N', 'S') );

