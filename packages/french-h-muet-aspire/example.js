const haspire = require('./dist/index.js');

// the list
console.log(haspire.getCompleteList()[0]);

// some clever functions
const test = 'hérissonne';
console.log(`dans "${test}" le h est aspiré ? ${haspire.isHAspire(test)}`);
