const filterLib = require("./filter");
const adj_fr_FR = require("./adj_fr_FR");
const helper = require("./helper");
const VerbsManager = require("./VerbsManager");
const ValueManager = require("./ValueManager");
const SynManager = require("./SynManager");
const AsmManager = require("./AsmManager");
var fs = require('fs');
var RandomManager = require('./RandomManager');


var cache = {};


function NlgLib(params) {

  const supportedLanguages = ['fr_FR', 'en_US'];

  this.has_said = {};
  this.triggered_refs = new Map();
  this.save_points = [];
  this.next_refs = new Map();

  this.ref_gender = new Map();
  this.ref_number = new Map();

  this.randomSeed = (params!=null && params.forceRandomSeed!=null) ? params.forceRandomSeed : Math.floor(Math.random() * 1000);
  //console.log("seed: " + this.randomSeed);
  this.randomManager = new RandomManager.RandomManager(this.randomSeed);

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
    this.plural = require('pluralize-fr');
  }

  // when called not directly after the rendering, but via the filter mixin
  this.filter = filterLib.filter;
  
  
  this.adj_fr_FR = adj_fr_FR;
  
  this.verbsManager = new VerbsManager.VerbsManager({language: this.language});
  this.valueManager = new ValueManager.ValueManager({language: this.language});
  this.synManager = new SynManager.SynManager({
    randomManager: this.randomManager,
    defaultSynoMode: params.defaultSynoMode || 'random'
  });
  this.asmManager = new AsmManager.AsmManager({
    randomManager: this.randomManager
  });

  this.helper = helper;
}


const filter = filterLib.filter;

module.exports = {
  NlgLib,
  filter,
  filterLib
};






function copySavePointDataFromTo(obj1, obj2) {
  obj2.has_said = Object.assign({}, obj1.has_said);
  obj2.triggered_refs = new Map(obj1.triggered_refs);
  obj2.ref_gender = new Map(obj1.ref_gender);
  obj2.ref_number = new Map(obj1.ref_number);
  if (obj2.randomManager == null) obj2.randomManager = {};
  obj2.randomManager.rndNextPos = obj1.randomManager.rndNextPos;
  obj2.next_refs = new Map(obj1.next_refs);
  
  if (obj2.synManager == null) obj2.synManager = {};
  obj2.synManager.synoSeq = new Map(obj1.synManager.synoSeq);
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
