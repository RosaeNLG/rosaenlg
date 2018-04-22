

function SynManager(params) {
  this.saveRollbackManager = params.saveRollbackManager;

  this.randomManager = params.randomManager;

  this.synoSeq = new Map();
  this.defaultSynoMode = params.defaultSynoMode;
};


SynManager.prototype.getNextSeqNotIn = function(which, size, exclude) {
  //console.log('are excluded: ' + JSON.stringify(exclude));
  
  var lastRecorded = this.synoSeq.get(which);
  var last = lastRecorded!=null ? lastRecorded : 0

  function getNext(last) {
    return last >= size ? 1 : last+1;
  }

  var logicalNext = getNext(last);
  while (exclude.indexOf(logicalNext)>-1) {
    logicalNext = getNext(logicalNext);
  }

  //console.log(last + ' will try ' + logicalNext);
  return logicalNext;
};


SynManager.prototype.synFct = function(items) {
  return items[Math.floor(this.randomManager.getNextRnd() * items.length)];
};

SynManager.prototype.simpleSyn= function(items) {
  if (this.spy.isEvaluatingEmpty()) {
    this.spy.appendPugHtml(' SOME_SYN ');
  } else {
    var chosen = this.synFct(items);
    this.spy.getPugMixins().insertVal(chosen);
  }
};

SynManager.prototype.runSynz = function(which, size, params, exclude) {

  //console.log(params);

  // first call
  if (!exclude) {
    exclude = [];
  }

  var synoMode = params.mode || this.defaultSynoMode;

  var toTest;

  if (synoMode=='sequence') {
    //console.log("SEQUENCE");

    toTest = this.getNextSeqNotIn(which, size, exclude);

  } else if (synoMode=='random') {
    // we force and it has not been excluded yet
    if (params.force!=null && exclude.length==0) {
      toTest = params.force;
    } else {
      toTest = this.randomManager.randomNotIn(size, params, exclude);
    }
  }

  if (toTest!=null) { // just stop if nothing new is found

    // console.log("to test: " + which + ' ' + toTest);
    this.saveRollbackManager.saveSituation({context:'isEmpty'});
    var html_before = this.spy.getPugHtml();

    try {
      this.spy.getPugMixins()[which](toTest, params);
    } catch (e) {
      throw e;
    }

    //console.log("before: <" + html_before + ">");
    //console.log("after: <" + pug_html + ">");
    if (html_before==this.spy.getPugHtml()) {
      //console.log("exclude: " + toTest);
      exclude.push(toTest);        
      this.saveRollbackManager.rollback();
      // continue
      this.runSynz(which, size, params, exclude);
    } else {
      // console.log("diff: <" + pug_html.substring(html_before.length) + ">");
      //util.deleteRollback();

      // rollback and do it for real
      // pug_html = html_before;
      this.saveRollbackManager.rollback();

      // add spaces before and after
      this.spy.appendPugHtml(" ");
      this.spy.getPugMixins()[which](toTest, params);
      this.spy.appendPugHtml(" ");

      if (synoMode=='sequence') {
        this.synoSeq.set(which, toTest);
      }

      // and don't continue
    }
  }
}


module.exports = {
  SynManager
};



