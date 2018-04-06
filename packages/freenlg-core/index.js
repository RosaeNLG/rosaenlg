var Random = require("random-js");
const filterLib = require("./filter");
const internalFcts = require("./internalFcts");
var fs = require('fs');


var cache = {};


function NlgLib(params) {

  const supportedLanguages = ['fr_FR', 'en_US'];

  this.getSnap = function() {
    var snap = {};
    snap.ref_gender = new Map(this.ref_gender);
    snap.ref_number = new Map(this.ref_number);
    snap.sizes = this.sizes;
    snap.synoType = this.synoType;
    return snap;
  };

  this.setFromSnap = function(snap) {
    this.sizes = snap.sizes;
    this.synoType = snap.synoType;
    this.ref_gender = new Map(snap.ref_gender);
    this.ref_number = new Map(snap.ref_number);
  }

  this.has_said = {};
  this.triggered_refs = new Map();
  this.save_points = [];
  this.next_refs = new Map();

  this.sizes = {};
  this.synoType = {};
  this.ref_gender = new Map();
  this.ref_number = new Map();

  this.rndNextPos = 0;
  this.rndTable = [];
  this.synoSeq = new Map();

  this.defaultSynoType = params.defaultSynoType!=null ? params.defaultSynoType : 'random';

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
    this.toTitleCase = require('titlecase');
  } else if (this.language=='fr_FR') {
    this.formatNumber = require('format-number-french');
    this.plural = require('pluralize-fr');
    this.titleCaseFrench = require('titlecase-french');
    this.frenchConjugator = new ( require("jslingua").getService("Morpho", "fra") )();    
  }

  const incrRandomer = 10;

  this.getNextRnd = function() {

    if (this.rndNextPos >= this.rndTable.length) {
      //console.log("ADDING NEW RANDOM IN THE TABLE");
      //const time = process.hrtime();
      for (var i=0; i<incrRandomer; i++) {
        /*
          comporte des biais : https://www.npmjs.com/package/random-js ; trouver mieux ?
        */
        this.rndTable.push( this.rndEngine.real(0, 1, false) );
      }
      //const diff = process.hrtime(time);
      //console.log(`random took ${diff[0]+diff[1]/NS_PER_SEC} s`);
    }

    var val = this.rndTable[this.rndNextPos];
    // console.log("random: " + val);
    this.rndNextPos++;

    return val;
  };

  // when called not directly after the rendering, but via the filter mixin
  this.filter = filterLib.filter;
  
  
  this.internalFcts = internalFcts;

}




module.exports = {
  NlgLib,
  //filterLib.filter,
  filterLib
};

