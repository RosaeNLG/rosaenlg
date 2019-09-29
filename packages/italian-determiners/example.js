const determiners = require('./dist/index.js');

// il
console.log(determiners.getDet('DEFINITE', 'M', 'S'));

// una
console.log(determiners.getDet('INDEFINITE', 'F', 'S'));

// questa
console.log(determiners.getDet('DEMONSTRATIVE', 'F', 'S', 'NEAR'));
