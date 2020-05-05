const determiners = require('./dist/index.js');

// el
console.log(determiners.getDet('DEFINITE', 'M', 'S', 'hombre', null));

// el
console.log(determiners.getDet('DEFINITE', 'F', 'S', 'agua', null));

// aquella
console.log(determiners.getDet('DEMONSTRATIVE', 'F', 'S', null, 'DISTAL'));
