const adjectives = require('./dist/index.js');

// "belles"
console.log(adjectives.agree('beau', 'F', 'P'));

// "vieil"
console.log(adjectives.agree('vieux', 'M', 'S', 'homme', true));
