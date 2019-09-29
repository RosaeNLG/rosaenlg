const FrenchVerbs = require('./dist/index.js');

// elle est allée
console.log('elle ' + FrenchVerbs.getConjugation('aller', 'PASSE_COMPOSE', 2, 'ETRE', 'F'));

// je finis
console.log('je ' + FrenchVerbs.getConjugation('finir', 'PRESENT', 0));

// true
console.log(FrenchVerbs.alwaysAuxEtre('demeurer'));

// true
console.log(FrenchVerbs.isIntransitive('voleter'));

// true
console.log(FrenchVerbs.isTransitive('abandonner'));
