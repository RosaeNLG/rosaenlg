const adj_fr_FR = require("./adj_fr_FR");
const helper = require("./helper");
const VerbsManager = require("./VerbsManager");
const ValueManager = require("./ValueManager");
const SynManager = require("./SynManager");
const AsmManager = require("./AsmManager");
const FilterManager = require("./FilterManager");
const RandomManager = require('./RandomManager');
const SaidManager = require("./SaidManager");
const GenderNumberManager = require("./GenderNumberManager");
const RefsManager = require("./RefsManager");


function NlgLib(params) {

  const supportedLanguages = ['fr_FR', 'en_US'];

  this.save_points = [];

  this.randomSeed = (params!=null && params.forceRandomSeed!=null) ? params.forceRandomSeed : Math.floor(Math.random() * 1000);
  //console.log("seed: " + this.randomSeed);
  this.randomManager = new RandomManager.RandomManager(this.randomSeed);

  this.language = params!=null ? params.language : null;
  if (supportedLanguages.indexOf(this.language)==-1) {
    console.log('ERROR: provided language is ' + this.language + ' while supported languages are ' + supportedLanguages.join(' '));
  }

  if (this.language=='en_US') {
    // console.log('USING compromise lib');
    this.compromise = require('compromise');
  } else if (this.language=='fr_FR') {
    this.plural = require('pluralize-fr');
  }

  this.adj_fr_FR = adj_fr_FR;
  
  this.genderNumberManager = new GenderNumberManager.GenderNumberManager({
    language: this.language,
    loadDicts: params.loadDicts
  });
  this.verbsManager = new VerbsManager.VerbsManager({
    language: this.language,
    genderNumberManager: this.genderNumberManager
  });
  this.valueManager = new ValueManager.ValueManager({language: this.language});
  this.synManager = new SynManager.SynManager({
    randomManager: this.randomManager,
    defaultSynoMode: params.defaultSynoMode || 'random'
  });
  this.asmManager = new AsmManager.AsmManager({
    randomManager: this.randomManager
  });
  this.filterManager = new FilterManager.FilterManager({language: this.language});
  this.saidManager = new SaidManager.SaidManager();
  this.refsManager = new RefsManager.RefsManager();

  this.helper = helper;
}

module.exports = {
  NlgLib
};


NlgLib.prototype.rollback = function() {
  //-console.log('ROLLBACK DATA');
  //-console.log('ROLLBACK DATA: size ' + util.save_points.length);
  var savePoint = this.save_points.pop();
  
  //-console.log('SAVEPOINT CONTENT: ' + JSON.stringify(savePoint));
  this.saidManager.has_said = Object.assign({}, savePoint.has_said);
  this.refsManager.triggered_refs = new Map(savePoint.triggered_refs);
  this.genderNumberManager.ref_gender = new Map(savePoint.ref_gender);
  this.genderNumberManager.ref_number = new Map(savePoint.ref_number);  
  this.randomManager.rndNextPos = savePoint.rndNextPos;
  this.refsManager.next_refs = new Map(savePoint.next_refs);
  this.synManager.synoSeq = new Map(savePoint.synoSeq);

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
    context: params.context,
    has_said: Object.assign({}, this.saidManager.has_said),
    triggered_refs: new Map(this.refsManager.triggered_refs),
    ref_gender: new Map(this.genderNumberManager.ref_gender),
    ref_number: new Map( this.genderNumberManager.ref_number ),
    rndNextPos: this.randomManager.rndNextPos,
    next_refs: new Map(this.refsManager.next_refs),
    synoSeq: new Map(this.synManager.synoSeq)
  };

  this.save_points.push(savePoint);

  if (savePoint.context=='isEmpty') {
    this.isEvaluatingEmpty = true;
  } else if (savePoint.context=='nextRep') {
    this.isEvaluatingNextRep = true; 
  }
};


NlgLib.prototype.deleteRollback = function() {
  this.save_points.pop();
};



