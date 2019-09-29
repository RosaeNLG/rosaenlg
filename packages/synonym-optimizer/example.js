const synOptimizer = require('./dist/index.js');

alts = ['The coffee is good. I love that coffee.', 'The coffee is good. I love that bewerage.'];

/*
The coffee is good. I love that coffee.: 0.5
The coffee is good. I love that bewerage.: 0
*/
alts.forEach(alt => {
  const score = synOptimizer.scoreAlternative('en_US', alt, null, null, null, null, null);
  console.log(`${alt}: ${score}`);
});
