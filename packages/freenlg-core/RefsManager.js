


function RefsManager(params) {
  this.saveRollbackManager = params.saveRollbackManager;
  this.genderNumberManager = params.genderNumberManager;
  this.randomManager = params.randomManager;

  this.triggered_refs = new Map();
  this.next_refs = new Map();

};

RefsManager.prototype.getNextRep = function(obj, params) {
  //console.log('GET NEXT REF');

  // there's already one planned
  if (this.getNextRef(obj)!=null) {
    //console.log('already one planned');
    return this.getNextRef(obj);
  }

  if (obj==null) {
    console.log('ERROR: getNextRep called on null object!');
  }

  // simulate
  var rndNextPosBefore = this.randomManager.rndNextPos;
  this.saveRollbackManager.saveSituation({context:'nextRep'});
  var hadRefBefore = this.hasTriggeredRef(obj);
  //console.log('hadRefBefore: ' + hadRefBefore);
  var lengthBefore = this.spy.getPugHtml().length;

  // cross dependency prevents from calling the function directly
  this.spy.getPugMixins()['value'](obj, params);

  // record the result before rollback
  var nextRef = {
    'isNextRep': true, // is not used
    valueForDebug: this.spy.getPugHtml().substring(lengthBefore),
    // we don't care about what will be triggered, but only if it has been triggered before
    REPRESENTANT: hadRefBefore ? 'ana' : 'ref',
    gender: this.genderNumberManager.getRefGender(obj),
    number: this.genderNumberManager.getRefNumber(obj),
    rndNextPos: rndNextPosBefore
  }
  //console.log("getNextRep will be:" + JSON.stringify(nextRef));

  // rollback
  // pug_html = html_before;
  this.saveRollbackManager.rollback();

  // register the result
  this.genderNumberManager.setRefGenderNumber(nextRef, nextRef.gender, nextRef.number);

  // save the nextRef for use when it will actually be triggered
  this.setNextRef(obj, nextRef);


  return nextRef;
}

RefsManager.prototype.dumpRefMap = function() {
  console.log('ref_gender size: ' + util.ref_gender.size);
  // console.log('ref_number: ' + dumpMap(util.ref_number));
};


RefsManager.prototype.resetRep = function(obj) {
  this.triggered_refs.delete(obj);
  // if we had asked for a next ref
  this.next_refs.delete(obj);
};

RefsManager.prototype.hasTriggeredRef = function(obj) {
  return this.triggered_refs.get(obj)==true ? true : false;
};

RefsManager.prototype.setTriggeredRef = function(obj) {
  this.triggered_refs.set(obj, true);
};

RefsManager.prototype.getNextRef = function(obj) {
  return this.next_refs.get(obj);
};

RefsManager.prototype.setNextRef = function(obj, nextRef) {
  this.next_refs.set(obj, nextRef);
};

RefsManager.prototype.deleteNextRef = function(obj) {
  this.next_refs.delete(obj);
};


module.exports = {
  RefsManager
};

