


function RefsManager() {

  this.triggered_refs = new Map();
  this.next_refs = new Map();

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

