var junit = require("junit");
const NlgLib = require("freenlg-core").NlgLib;

var it = junit();

function getRandomManager() {
  var nlgLib = new NlgLib({
    language: 'en_US',
    forceRandomSeed: 1
  });
  return nlgLib.randomManager;
};

function getDistrib(iter, range, params, excluded) {
  var randomManager = getRandomManager();
  var distrib = {};
  for (var i=0; i<iter; i++) {
    var rnd = randomManager.randomNotIn(range, params, excluded);
    distrib[rnd] = distrib[rnd]+1 || 1;
  }
  return distrib;
};

function testClassicDistribution() {
  
  const iter = 10000;
  const range = 10;
  var distrib = getDistrib(iter, range, {}, []);

  for (var k in distrib) {
    var proportion = iter / distrib[k];
    it(`classic distribution: proportion of ${k}: ${proportion}`, () => it.eq(true, 
      proportion > range*0.9 && proportion < range*1.1
    ) );    
  }
};

function testDistributionWithExcluded(range, excluded) {
  const iter = 10000;
  var distrib = getDistrib(iter, range, {}, excluded);

  excluded.map(ex => {
    it(`${ex} is excluded: ${distrib[ex]}`, () => it.eq(true, distrib[ex]==null) )
  });

  var realRange = range - excluded.length;
  for (var k in distrib) {
    var proportion = iter / distrib[k];
    it(`proportion of ${k}: ${proportion}`, () => it.eq(true, 
      proportion > realRange*0.9 && proportion < realRange*1.1
    ) );
  }

};

function testDistributionWithWeights(range, weights) {
  var randomManager = getRandomManager();


};

module.exports = it => {
  testClassicDistribution();
  
  testDistributionWithExcluded(20, [11,12,13,14,15,16,17,18,19,20]);
  testDistributionWithExcluded(20, [1,3,5,7,9,11,13,15,17,19]);
  testDistributionWithExcluded(4, [1,2,3]);


  // testDistributionWithWeights(5, { '2': {weight: 5} });

  // testDistributionWithWeightsAndExcluded


};

