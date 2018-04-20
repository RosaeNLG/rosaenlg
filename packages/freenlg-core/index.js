
const Helper = require("./lib/Helper");
const AdjectiveManager = require("./lib/AdjectiveManager");
const VerbsManager = require("./lib/VerbsManager");
const ValueManager = require("./lib/ValueManager");
const SynManager = require("./lib/SynManager");
const AsmManager = require("./lib/AsmManager");
const FilterManager = require("./lib/FilterManager");
const RandomManager = require('./lib/RandomManager');
const SaidManager = require("./lib/SaidManager");
const GenderNumberManager = require("./lib/GenderNumberManager");
const RefsManager = require("./lib/RefsManager");


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

  this.helper = new Helper.Helper({});

  this.genderNumberManager = new GenderNumberManager.GenderNumberManager({
    language: this.language,
    loadDicts: params.loadDicts
  });
  this.verbsManager = new VerbsManager.VerbsManager({
    language: this.language,
    genderNumberManager: this.genderNumberManager
  });
  this.synManager = new SynManager.SynManager({
    randomManager: this.randomManager,
    defaultSynoMode: params.defaultSynoMode || 'random',
    saveRollbackManager: this,
  });
  this.asmManager = new AsmManager.AsmManager({
    randomManager: this.randomManager,
    saveRollbackManager: this
  });
  this.filterManager = new FilterManager.FilterManager({language: this.language});
  this.saidManager = new SaidManager.SaidManager();
  this.refsManager = new RefsManager.RefsManager({
    saveRollbackManager: this,
    genderNumberManager: this.genderNumberManager,
    randomManager: this.randomManager
  });
  this.adjectiveManager = new AdjectiveManager.AdjectiveManager({
    language: this.language,
    genderNumberManager: this.genderNumberManager
  });
  this.valueManager = new ValueManager.ValueManager({
    language: this.language,
    refsManager: this.refsManager,
    helper: this.helper,
    randomManager: this.randomManager
  });

}

module.exports = {
  NlgLib
};

NlgLib.prototype.setSpy = function(spy) {
  this.spy = spy;

  // transfer knowledge
  this.valueManager.spy = spy;
  this.synManager.spy = spy;
  this.verbsManager.spy = spy;
  this.refsManager.spy = spy;
  this.filterManager.spy = spy;
  this.adjectiveManager.spy = spy;
  this.asmManager.spy = spy;
  this.helper.spy = spy;
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

  this.spy.setPugHtml(savePoint.htmlBefore);
}

NlgLib.prototype.saveSituation = function(params) {
  //console.log('SAVING DATA');
  //console.log(this.spy);
  //-console.log('WHEN SAVING: ' + JSON.stringify(util));
  var savePoint = {
    htmlBefore: this.spy.getPugHtml(),
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



