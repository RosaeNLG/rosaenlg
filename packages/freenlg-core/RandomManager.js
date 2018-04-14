
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


// PRIVATE
// [ 0 ; rangeLength [
/*
RandomManager.prototype.randomIntFromInterval = function(rangeLength) {
  return Math.floor(this.getNextRnd()*rangeLength);
}
*/

RandomManager.prototype.getItemWeight = function(params, item) {
  return ( params[`${item}`] ? params[`${item}`].weight : null ) || 1;
}
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
RandomManager.prototype.randomNotIn = function(max, params, excludes) {
  // console.log(`ASKS: [1,${max}], excludes: ${excludes}`);

  if (excludes.length == max) { // it won't be possible to find a new one
      return null;
  }

  var sumOfWeights = this.getSumOfWeights(max, params);

  var randomWeight = Math.floor( this.getNextRnd()*sumOfWeights ) + 1;

  //console.log(`sumOfWeights: ${sumOfWeights}, randomWeight: ${randomWeight}`);

  for (var i=1; i<=max; i++) {
    randomWeight = randomWeight - this.getItemWeight(params, i);
    if (randomWeight <= 0) {
      //console.log(`=> found: ${i}`);
      return i;
    }
  }

  //console.log('PAS BON !');

  /*


  var sortedExcludes = excludes.sort((a, b) => a - b);

  var rangeLength = max - sortedExcludes.length;
  var randomInt = this.randomIntFromInterval(rangeLength) + 1;
  // console.log("ONE RND: " + randomInt);
  
  for(var i = 0; i < sortedExcludes.length; i++) {
    if(sortedExcludes[i] > randomInt) {
      // console.log(`=> found: ${randomInt}`);
      return randomInt;
    }
    randomInt++;
  }
  // console.log(`=> found: ${randomInt}`);
  return randomInt;
  */
}

module.exports = {
  RandomManager
};


