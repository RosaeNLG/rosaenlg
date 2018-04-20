var fs = require('fs');


var cache = {};

function GenderNumberManager(params) {
  this.ref_number = new Map();
  this.ref_gender = new Map();
  this.language = params.language;

  if (this.language=='fr_FR' && params.loadDicts!=false) {
    if (cache.wordsWithGender!=null) {
      //console.log('DID NOT RELOAD');
      this.wordsWithGender = cache.wordsWithGender;
    } else {
      //console.log('LOAD');
      this.wordsWithGender = JSON.parse(fs.readFileSync(__dirname + '/../resources_pub/fr_FR/wordsWithGender.json', 'utf8'));
      cache.wordsWithGender = this.wordsWithGender;
    }
  }
};


GenderNumberManager.prototype.setRefGenderNumber = function(obj, gender, number) {
  if (isEmptyObj(obj)) {
    console.log('ERROR: setRefGenderNumber obj should not be empty!');
    throw new Error("Something unexpected has occurred.");
    return;
  }
  // dumpRefMap();
  this.setRefGender(obj, gender);
  this.setRefNumber(obj, number);
  // dumpRefMap();
}


GenderNumberManager.prototype.setRefGender = function(obj, gender) {
  if (isEmptyObj(obj)) {
    console.log('ERROR: setRefGender obj should not be empty!');
    throw new Error("Something unexpected has occurred.");
    return;
  }
  // dumpRefMap();
  // console.log('setRefGender: ' + JSON.stringify(obj).substring(0, 20) + ' => ' + gender);
  this.ref_gender.set(obj, gender);
  // dumpRefMap();
}

GenderNumberManager.prototype.getRefGender = function(obj) {
  //console.log('getRefGender called on: ' + JSON.stringify(obj));
  
  var inMainMap = this.ref_gender.get(obj);
  if (inMainMap!=null) return inMainMap;
  
  if (typeof obj === 'string' && this.language=='fr_FR' && this.wordsWithGender!=null) {
    //console.log("trying to find in wordsWithGender: " + util.wordsWithGender[obj]);
    return this.wordsWithGender[obj];
  }

  return null;
}

GenderNumberManager.prototype.registerSubst = function(root, gender, number) {
  this.setRefGender(root, gender);
  this.setRefNumber(root, number);
};


GenderNumberManager.prototype.getAnonymous = function(gender, number) {
  // console.log("getAnonymous");
  var obj = {'isAnonymous': true};
  this.setRefGenderNumber(obj, gender, number);
  return obj;
};


GenderNumberManager.prototype.getRefNumber = function(obj) {
  return this.ref_number.get(obj);
};

GenderNumberManager.prototype.setRefNumber = function(obj, number) {
  if (isEmptyObj(obj)) {
    console.log('ERROR: setRefNumber obj should not be empty!');
    return;
  }
  // dumpRefMap();
  this.ref_number.set(obj, number);
  // dumpRefMap();
};

function isEmptyObj(obj) {
  if (obj==null) return true;
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};


module.exports = {
  GenderNumberManager
};

