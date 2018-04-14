
var Random = require("random-js");


function RandomManager(randomSeed) {
  this.incrRandomer = 10;
  this.rndNextPos = 0;
  this.rndTable = [];

  this.rndEngine = new Random(Random.engines.mt19937().seed(randomSeed));
  
}

RandomManager.prototype.getNextRnd = function() {

  if (this.rndNextPos >= this.rndTable.length) {
    //console.log("ADDING NEW RANDOM IN THE TABLE");
    //const time = process.hrtime();
    for (var i=0; i<this.incrRandomer; i++) {
      /*
        comporte des biais : https://www.npmjs.com/package/random-js ; trouver mieux ?
      */
      this.rndTable.push( this.rndEngine.real(0, 1, false) );
    }
    //const diff = process.hrtime(time);
    //console.log(`random took ${diff[0]+diff[1]/NS_PER_SEC} s`);
  }

  var val = this.rndTable[this.rndNextPos];
  this.rndNextPos++;

  return val;
};



RandomManager.prototype.getItemWeight = function(params, item) {
  return ( params[`${item}`] ? params[`${item}`].weight : null ) || 1;
}

// PRIVATE
RandomManager.prototype.getSumOfWeights = function(max, params) {
  var sumOfWeights = 0;
  for (var i=1; i<=max; i++) {
    sumOfWeights += this.getItemWeight(params, i);
  }
  return sumOfWeights;
}


/*
  https://stackoverflow.com/questions/6443176/how-can-i-generate-a-random-number-within-a-range-but-exclude-some
  https://medium.com/@peterkellyonline/weighted-random-selection-3ff222917eb6
  [ 1 ; max ]
*/




// PRIVATE
RandomManager.prototype.getTargetIndex = function(origIndex, excludes) {
  var targetIndex = 0;
  for (var i=1; i<=origIndex; i++) {
    targetIndex++;
    while(excludes.indexOf(targetIndex)>-1) {
      targetIndex++;
    }
  }
  return targetIndex;
}

// PRIVATE
RandomManager.prototype.getWeightedRandom = function(max, weights) {
  var sumOfWeights = this.getSumOfWeights(max, weights);
  var randomWeight = Math.floor( this.getNextRnd()*sumOfWeights ) + 1;

  //console.log(`sumOfWeights: ${sumOfWeights}, randomWeight: ${randomWeight}`);

  for (var i=1; i<=max; i++) {
    randomWeight = randomWeight - this.getItemWeight(weights, i);
    if (randomWeight <= 0) {
      //console.log(`=> found: ${i}`);
      return i;
    }
  }
}


RandomManager.prototype.randomNotIn = function(max, weights, excludes) {
  // console.log(`ASKS: [1,${max}], excludes: ${excludes}`);

  if (excludes.length == max) { // it won't be possible to find a new one
      return null;
  }

  //il faut translater les index des poids
  var translatedWeights = {};
  var newIndex = 0;
  for (var i=1; i<=max; i++) {
    if (excludes.indexOf(i)==-1) {
      newIndex++;
      translatedWeights[newIndex] = { weight: this.getItemWeight(weights, i) };
    }
  }

  //console.log(`original weights: ${JSON.stringify(weights)}, excluded: ${excludes}, translated weights: ${JSON.stringify(translatedWeights)}`);

  var weightedRandom = this.getWeightedRandom( max - excludes.length, translatedWeights );

  //console.log(`must return non excluded #${found}`);
  // inverse mapping
  var targetIndex = this.getTargetIndex(weightedRandom, excludes);
  //console.log(targetIndex);
  return targetIndex;

  
  //console.log(`and it is: ${index}`);
  return index;
  //console.log('PAS BON !');

}

module.exports = {
  RandomManager
};


