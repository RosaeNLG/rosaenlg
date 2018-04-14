var junit = require("junit");
const NlgLib = require("freenlg-core").NlgLib;

var it = junit();


function testClassicDistribution() {
  var nlgLib = new NlgLib({
    language: 'en_US',
    forceRandomSeed: 1
  });
  var randomManager = nlgLib.randomManager;

  const iter = 10000;
  const range = 10;
  var distrib = {};
  for (var i=0; i<iter; i++) {
    var rnd = randomManager.randomNotIn(range, {}, []);
    distrib[rnd] = distrib[rnd]+1 || 1;
  }
  for (var k in distrib) {
    var proportion = iter / distrib[k];
    it(`classic distribution: proportion of ${k}: ${proportion}`, () => it.eq(true, 
      proportion > range*0.9 && proportion < range*1.1
    ) );    
  }
};

function testDistributionWithExcluded(range, excluded) {
  var nlgLib = new NlgLib({
    language: 'en_US',
    forceRandomSeed: 1
  });
  var randomManager = nlgLib.randomManager;

  const iter = 10000;
  var distrib = {};
  for (var i=0; i<iter; i++) {
    var rnd = randomManager.randomNotIn(range, {}, excluded);
    distrib[rnd] = distrib[rnd]+1 || 1;
  }
  
  excluded.map(ex => {
    it(`${ex} is excluded`, () => it.eq(true, distrib[ex]==null) )
  });

  var realRange = range - excluded.length;
  for (var k in distrib) {
    var proportion = iter / distrib[k];
    it(`proportion of ${k}: ${proportion}`, () => it.eq(true, 
      proportion > realRange*0.9 && proportion < realRange*1.1
    ) );
  }

};

module.exports = it => {
  testClassicDistribution();
  testDistributionWithExcluded(20, [11,12,13,14,15,16,17,18,19,20]);
  testDistributionWithExcluded(20, [1,3,5,7,9,11,13,15,17,19]);
  testDistributionWithExcluded(4, [1,2,3]);

};

