

function SynManager(params) {

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


SynManager.prototype.syn_fct = function(items) {
  return items[Math.floor(this.randomManager.getNextRnd() * items.length)];
};


module.exports = {
  SynManager
};



