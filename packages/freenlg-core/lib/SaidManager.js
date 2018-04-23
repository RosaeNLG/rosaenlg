


function SaidManager() {
  this.has_said = {};

};


module.exports = {
  SaidManager
};



SaidManager.prototype.recordSaid = function(key) {
  if (key==null) {
    console.log('ERROR: recordSaid with null arg!');
  }
  this.has_said[key] = true;
};

SaidManager.prototype.deleteSaid = function(key) {
  if (this.hasSaid(key)) {
    this.has_said[key] = null;   
  }
};

SaidManager.prototype.hasSaid = function(key) {
  if (key==null) {
    console.log('ERROR: hasSaid with null arg!');
  }
  return this.has_said[key] || false;
};

SaidManager.prototype.dumpHasSaid = function() {
  console.log(JSON.stringify(util.saidManager.has_said));
};

