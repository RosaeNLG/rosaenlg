var determiners = require('./dist/index.js');

// der
console.log(determiners.getDet('DEFINITE', 'NOMINATIVE', null, null, 'M', 'S'));

// dieser
console.log(determiners.getDet('DEMONSTRATIVE', 'GENITIVE', null, null, 'M', 'P'));

// seines
console.log(determiners.getDet('POSSESSIVE', 'GENITIVE', 'N', 'S', 'M', 'S'));
