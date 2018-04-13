var Random = require("random-js");
const filterLib = require("./filter");
const internalFcts = require("./internalFcts");
var fs = require('fs');


var cache = {};


function NlgLib(params) {

  const supportedLanguages = ['fr_FR', 'en_US'];

  this.has_said = {};
  this.triggered_refs = new Map();
  this.save_points = [];
  this.next_refs = new Map();

  this.ref_gender = new Map();
  this.ref_number = new Map();

  this.rndNextPos = 0;
  this.rndTable = [];
  this.synoSeq = new Map();

  this.defaultSynoMode = params.defaultSynoMode!=null ? params.defaultSynoMode : 'random';

  this.randomSeed = (params!=null && params.forceRandomSeed!=null) ? params.forceRandomSeed : Math.floor(Math.random() * 1000);
  //console.log("seed: " + this.randomSeed);
  this.rndEngine = new Random(Random.engines.mt19937().seed(this.randomSeed));

  this.language = params!=null ? params.language : null;
  if (supportedLanguages.indexOf(this.language)==-1) {
    console.log('ERROR: provided language is ' + this.language + ' while supported languages are ' + supportedLanguages.join(' '));
  }

  if (this.language=='fr_FR' && params.loadDicts!=false) {
    if (cache.wordsWithGender!=null) {
      //console.log('DID NOT RELOAD');
      this.wordsWithGender = cache.wordsWithGender;
    } else {
      //console.log('LOAD');
      this.wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/resources_pub/fr_FR/wordsWithGender.json', 'utf8'));
      cache.wordsWithGender = this.wordsWithGender;
    }
  }

  if (this.language=='en_US') {
    // console.log('USING compromise lib');
    this.compromise = require('compromise');
  } else if (this.language=='fr_FR') {
    this.formatNumber = require('format-number-french');
    this.plural = require('pluralize-fr');
    this.frenchConjugator = new ( require("jslingua").getService("Morpho", "fra") )();    
  }

  this.incrRandomer = 10;

  // when called not directly after the rendering, but via the filter mixin
  this.filter = filterLib.filter;
  
  
  this.internalFcts = internalFcts;

}


const filter = filterLib.filter;

module.exports = {
  NlgLib,
  filter,
  filterLib
};



NlgLib.prototype.getNextRnd = function() {

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


function copySavePointDataFromTo(obj1, obj2) {
  obj2.has_said = Object.assign({}, obj1.has_said);
  obj2.triggered_refs = new Map(obj1.triggered_refs);
  obj2.ref_gender = new Map(obj1.ref_gender);
  obj2.ref_number = new Map(obj1.ref_number);
  obj2.rndNextPos = obj1.rndNextPos;
  obj2.next_refs = new Map(obj1.next_refs);
  obj2.synoSeq = new Map(obj1.synoSeq);
}

NlgLib.prototype.rollback = function() {
  //-console.log('ROLLBACK DATA');
  //-console.log('ROLLBACK DATA: size ' + util.save_points.length);
  var savePoint = this.save_points.pop();
  
  //-console.log('SAVEPOINT CONTENT: ' + JSON.stringify(savePoint));
  copySavePointDataFromTo(savePoint, this);

  if (savePoint.context=='isEmpty') {
    this.isEvaluatingEmpty = false;
  } else if (savePoint.context=='nextRep') {
    this.isEvaluatingNextRep = false; 
  }

  return savePoint.htmlBefore;
}


NlgLib.prototype.saveSituation = function (pug_html, params) {
  //-console.log('SAVING DATA');
  //-console.log('WHEN SAVING: ' + JSON.stringify(util));
  var savePoint = {
    htmlBefore: pug_html,
    context: params.context
  };
  copySavePointDataFromTo(this, savePoint);
  this.save_points.push(savePoint);

  if (savePoint.context=='isEmpty') {
    this.isEvaluatingEmpty = true;
  } else if (savePoint.context=='nextRep') {
    this.isEvaluatingNextRep = true; 
  }
}


NlgLib.prototype.deleteRollback = function() {
  this.save_points.pop();
}
