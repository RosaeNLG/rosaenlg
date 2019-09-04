var determiners = require('./dist/index.js');

// le
console.log(determiners.getDet('DEFINITE', 'F', 'S', null));

// ses
console.log(determiners.getDet('POSSESSIVE', 'M', 'P', 'S'));
