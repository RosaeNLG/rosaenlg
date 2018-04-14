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

function getDistrib(randomManager, iter, range, params, excluded) {
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
  var randomManager = getRandomManager();
  var distrib = getDistrib(randomManager, iter, range, {}, []);

  for (var k in distrib) {
    var proportion = distrib[k] / iter;
    it(`classic distribution: proportion of ${k}: ${proportion}`, () => it.eq(true, 
      proportion > 1/range*0.9 && proportion < 1/range*1.1
    ) );    
  }
};

function testDistributionWithExcluded(range, excluded) {
  const iter = 10000;
  var randomManager = getRandomManager();
  var distrib = getDistrib(randomManager, iter, range, {}, excluded);

  excluded.map(ex => {
    it(`${ex} is excluded ${distrib[ex]!=null ? distrib[ex] : ''}`, () => it.eq(true, distrib[ex]==null) )
  });

  var realRange = range - excluded.length;
  for (var k in distrib) {
    var proportion = distrib[k] / iter;
    it(`proportion of ${k}: ${proportion}`, () => it.eq(true, 
      proportion > 1/realRange*0.9 && proportion < 1/realRange*1.1
      //true
    ) );
  }

};

function testDistributionWithWeights(range, weights) {
  const iter = 10000;
  var randomManager = getRandomManager();
  var distrib = getDistrib(randomManager, iter, range, weights, []);

  var sumOfWeights = getSumOfWeightsNotExcluded(randomManager, range, weights, []);
  for (var k in distrib) {
    var proportion = distrib[k] / iter;
    var weight = randomManager.getItemWeight(weights, k);
    var expectedProp = weight / sumOfWeights;
    it(`weighted distribution: proportion of ${k}: ${proportion}, weight is ${weight} / totalw is ${sumOfWeights}`, () => it.eq(true, 
      proportion > expectedProp*0.9 && proportion < expectedProp*1.1
      // true
    ) );    
  }
};

function getSumOfWeightsNotExcluded(randomManager, range, weights, excluded) {
  var sumOfWeights = 0;
  for (var i=1; i<=range; i++) {
    if (excluded.indexOf(i)==-1) {
      sumOfWeights += randomManager.getItemWeight(weights, i);
    }
  }
  return sumOfWeights;
}

function testDistributionWithWeightsAndExcluded(range, weights, excluded) {
  const iter = 10000;
  var randomManager = getRandomManager();
  var distrib = getDistrib(randomManager, iter, range, weights, excluded);

  excluded.map(ex => {
    it(`${ex} is excluded ${distrib[ex]!=null ? distrib[ex] : ''}`, () => it.eq(true, distrib[ex]==null) )
  });

  var sumOfWeights = getSumOfWeightsNotExcluded(randomManager, range, weights, excluded);

  for (var k in distrib) {
    var proportion = distrib[k] / iter;
    var weight = randomManager.getItemWeight(weights, k);
    var expectedProp = weight / sumOfWeights;
    it(`weighted distribution: proportion of ${k}: ${proportion}, weight is ${weight} / totalw is ${sumOfWeights}`, () => it.eq(true, 
      proportion > expectedProp*0.9 && proportion < expectedProp*1.1
      //true
    ) );    
  }
};


module.exports = it => {
  
  testClassicDistribution();

  testDistributionWithExcluded(20, [11,12,13,14,15,16,17,18,19,20]);
  testDistributionWithExcluded(20, [1,3,5,7,9,11,13,15,17,19]);
  testDistributionWithExcluded(4, [1,2,3]);


  testDistributionWithWeights(10, { '2': {weight: 5} });
  testDistributionWithWeights(2, { '1':{weight:2}, '2': {weight:2} });
  testDistributionWithWeights(2, { '1':{weight:2}, '2': {weight:20} });
  testDistributionWithWeights(5, { '1':{weight:3}, '8': {weight:5} });
  
  
  testDistributionWithWeightsAndExcluded(4, { '2': {weight:5} }, [1,4]);
  testDistributionWithWeightsAndExcluded(4, { '2': {weight:5} }, [1,2]);


};

