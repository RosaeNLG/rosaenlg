var FrenchVerbs = require('./dist/index.js');

// elle est allée
console.log('elle ' + FrenchVerbs.getConjugation('aller', 2, null, 'ETRE', 'PASSE_COMPOSE', 'F', null));

// je finis
console.log('je ' + FrenchVerbs.getConjugation('finir', 0, null, null, 'PRESENT'));

// true
console.log(FrenchVerbs.alwaysAuxEtre('demeurer'));

// true
console.log(FrenchVerbs.isIntransitive('voleter'));

// true
console.log(FrenchVerbs.isTransitive('abandonner'));
