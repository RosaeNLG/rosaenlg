var assert = require('assert');
const NlgLib = require('../../dist/NlgLib').NlgLib;

function getRandomManager() {
  var nlgLib = new NlgLib({
    language: 'en_US',
    forceRandomSeed: 1,
  });
  return nlgLib.randomManager;
}

function getDistrib(randomManager, iter, range, params, excluded) {
  var distrib = {};
  for (var i = 0; i < iter; i++) {
    var rnd = randomManager.randomNotIn(range, params, excluded);
    distrib[rnd] = distrib[rnd] + 1 || 1;
  }
  return distrib;
}

function getSumOfWeightsNotExcluded(randomManager, range, weights, excluded) {
  var sumOfWeights = 0;
  for (var i = 1; i <= range; i++) {
    if (excluded.indexOf(i) === -1) {
      sumOfWeights += randomManager.getItemWeight(weights, i);
    }
  }
  return sumOfWeights;
}

describe('random', function() {
  describe('testClassicDistribution', function() {
    const iter = 10000;
    const range = 10;
    var randomManager = getRandomManager();
    var distrib = getDistrib(randomManager, iter, range, {}, []);

    for (var k in distrib) {
      var proportion = distrib[k] / iter;
      it(`classic distribution: proportion of ${k}: ${proportion}`, function() {
        assert(proportion > (1 / range) * 0.9 && proportion < (1 / range) * 1.1);
      });
    }
  });

  describe('testDistributionWithExcluded', function() {
    const testCasesDistributionWithExcluded = [
      { range: 20, excluded: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
      { range: 20, excluded: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19] },
      { range: 4, excluded: [1, 2, 3] },
    ];

    testCasesDistributionWithExcluded.forEach(function(testCase) {
      const iter = 10000;
      var randomManager = getRandomManager();
      var distrib = getDistrib(randomManager, iter, testCase.range, {}, testCase.excluded);

      testCase.excluded.map(function(ex) {
        it(`${ex} is excluded ${distrib[ex] ? distrib[ex] : ''}`, function() {
          assert(!distrib[ex]);
        });
      });

      var realRange = testCase.range - testCase.excluded.length;
      for (var k in distrib) {
        var proportion = distrib[k] / iter;
        it(`proportion of ${k}: ${proportion}`, function() {
          assert(proportion > (1 / realRange) * 0.9 && proportion < (1 / realRange) * 1.1);
        });
      }
    });
  });

  describe('testDistributionWithWeights', function() {
    const testCasesDistributionWithWeights = [
      { range: 10, weights: { '2': { weight: 5 } } },
      { range: 2, weights: { '1': { weight: 2 }, '2': { weight: 2 } } },
      { range: 2, weights: { '1': { weight: 2 }, '2': { weight: 20 } } },
      { range: 5, weights: { '1': { weight: 3 }, '8': { weight: 5 } } },
    ];

    testCasesDistributionWithWeights.forEach(function(testCase) {
      const iter = 10000;
      var randomManager = getRandomManager();
      var distrib = getDistrib(randomManager, iter, testCase.range, testCase.weights, []);

      var sumOfWeights = getSumOfWeightsNotExcluded(randomManager, testCase.range, testCase.weights, []);
      for (var k in distrib) {
        var proportion = distrib[k] / iter;
        var weight = randomManager.getItemWeight(testCase.weights, k);
        var expectedProp = weight / sumOfWeights;
        it(`weighted distribution: proportion of ${k}: ${proportion}, weight is ${weight} / totalw is ${sumOfWeights}`, function() {
          assert(proportion > expectedProp * 0.9 && proportion < expectedProp * 1.1);
        });
      }
    });
  });

  describe('testDistributionWithWeightsAndExcluded', function() {
    const testCasesDistributionWithWeightsAndExcluded = [
      { range: 4, weights: { '2': { weight: 5 } }, excluded: [1, 4] },
      { range: 4, weights: { '2': { weight: 5 } }, excluded: [1, 2] },
      { range: 5, weights: { '1': { weight: 2 }, '2': { weight: 5 } }, excluded: [3, 4] },
    ];

    testCasesDistributionWithWeightsAndExcluded.forEach(function(testCase) {
      const iter = 10000;
      var randomManager = getRandomManager();
      var distrib = getDistrib(randomManager, iter, testCase.range, testCase.weights, testCase.excluded);

      testCase.excluded.map(function(ex) {
        it(`${ex} is excluded ${distrib[ex] ? distrib[ex] : ''}`, function() {
          assert(!distrib[ex]);
        });
      });

      var sumOfWeights = getSumOfWeightsNotExcluded(randomManager, testCase.range, testCase.weights, testCase.excluded);

      for (var k in distrib) {
        var proportion = distrib[k] / iter;
        var weight = randomManager.getItemWeight(testCase.weights, k);
        var expectedProp = weight / sumOfWeights;
        it(`weighted distribution: proportion of ${k}: ${proportion}, weight is ${weight} / totalw is ${sumOfWeights}`, function() {
          assert(proportion > expectedProp * 0.9 && proportion < expectedProp * 1.1);
        });
      }
    });
  });
});
