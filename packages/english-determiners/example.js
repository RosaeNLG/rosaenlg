var determiners = require('./dist/index.js');

// the
console.log( determiners.getDet('DEFINITE', 'S', null) );

// those
console.log( determiners.getDet('DEMONSTRATIVE', 'P', 'FAR') );

