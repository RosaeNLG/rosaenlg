var haspire = require('./dist/index.js');

// the full list
console.log( haspire.hAspireList );

// some clever functions
const test = 'hérissonne';
console.log(`dans "${test}" le h est aspiré ? ${haspire.isHAspire(test)}`);
