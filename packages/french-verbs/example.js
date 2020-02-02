const FrenchVerbs = require('./dist/index.js');
const Lefff = require('french-verbs-lefff');

// elle est allée
console.log('elle ' + FrenchVerbs.getConjugation(Lefff, 'aller', 'PASSE_COMPOSE', 2, 'ETRE', 'F'));

// je finis
console.log('je ' + FrenchVerbs.getConjugation(Lefff, 'finir', 'PRESENT', 0));
