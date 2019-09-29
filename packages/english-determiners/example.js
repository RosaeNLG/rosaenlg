const determiners = require('./dist/index.js');

// the
console.log(determiners.getDet('DEFINITE', null, null, 'S', null));

// those
console.log(determiners.getDet('DEMONSTRATIVE', null, null, 'P', 'FAR'));

// their
console.log(determiners.getDet('POSSESSIVE', null, 'P', 'S', null));
