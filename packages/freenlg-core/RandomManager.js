
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
RandomManager.prototype.randomIntFromInterval = function(min,max) {
  return Math.floor(this.getNextRnd()*(max-min+1)+min);
}

// could/should be improved https://stackoverflow.com/questions/6443176/how-can-i-generate-a-random-number-within-a-range-but-exclude-some
RandomManager.prototype.randomNotIn = function(min, max, exclude) {
  // console.log( 'exclude list: ' + JSON.stringify(exclude) );
  if (exclude.length == max-min+1) { // it won't be possible to find a new one
      return null;
  }
  while (true) {
    var rnd = this.randomIntFromInterval(min, max);
    if (exclude.indexOf(rnd) == -1) {
      return rnd;
    }
  }
}

module.exports = {
  RandomManager
};


