

function SubstantiveManager(params) {
  this.language = params.language;
  this.genderNumberManager = params.genderNumberManager;

  if (this.language=='en_US') {
    this.compromise = require('compromise');
  } else if (this.language=='fr_FR') {
    this.plural = require('pluralize-fr');
  }

};


module.exports = {
  SubstantiveManager
};

SubstantiveManager.prototype.getSubstantive_en_US = function(subst, gender, number) {
  if (number=='S') {
    return subst;
  } else {
    // maybe we could have a more efficient way to call the lib here?
    return this.compromise(subst).nouns().toPlural().all().out();
  }
};


// todo, or not todo?
SubstantiveManager.prototype.getSubstFeminine_fr_FR = function(subst) {
  return subst + 'E';    
};

SubstantiveManager.prototype.getSubstPlural_fr_FR = function(subst) {
  return this.plural(subst);
};

SubstantiveManager.prototype.getSubstantive_fr_FR = function(subst, gender, number) {
  var withGender = gender=='F' ? this.getSubstFeminine_fr_FR(subst) : subst;
  var withNumber = number=='P' ? this.getSubstPlural_fr_FR(withGender) : withGender;
  return withNumber;
};

SubstantiveManager.prototype.getSubstantive = function(subst, subject) {
  if (this.spy.isEvaluatingEmpty()) {
    return 'SOME_SUBST';
  } else {
    var gender = this.genderNumberManager.getRefGender(subject);
    var number = this.genderNumberManager.getRefNumber(subject);

    switch(this.language) {
      case 'en_US':
        return this.getSubstantive_en_US(subst, gender, number);
      case 'fr_FR':
        return this.getSubstantive_fr_FR(subst, gender, number);
      }
  }
};
