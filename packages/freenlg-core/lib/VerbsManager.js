
function VerbsManager(params) {
  this.language = params.language;
  this.genderNumberManager = params.genderNumberManager;

  if (this.language=='en_US') {
    // console.log('USING compromise lib');
    this.compromise = require('compromise');
  } else if (this.language=='fr_FR') {
    this.frenchConjugator = new ( require("jslingua").getService("Morpho", "fra") )();    
  }

}


VerbsManager.prototype.getAgreeVerb = function(subject, verbInfo) {
  if (this.spy.isEvaluatingEmpty()) {
    return 'SOME_VERB';
  } else {

    var verbName = typeof verbInfo === 'string' ? verbInfo : verbInfo.verb;
    if (verbName==null) { console.log("ERROR: verb needed."); }

    var tense = ( typeof verbInfo === 'string' || verbInfo.tense==null ) ? 'PRESENT' : verbInfo.tense;
    //console.log('verb=' + verbName + ' tense=' + tense + ' params: ' + JSON.stringify(verbInfo));

    var number = this.genderNumberManager.getRefNumber(subject);
    var person;
    if (number=='P') {
      person = 5;
    } else {
      person = 2;
    }

    return this.getConjugation(verbName, tense, person);
  }
};



VerbsManager.prototype.getConjugation = function(verb, tense, person) {
  switch (this.language) {
    case 'en_US':
      return this.getConjugation_en_US(verb, tense, person)
      break;
    case 'fr_FR':
      return this.getConjugation_fr_FR(verb, tense, person)
      break;
  }
};

VerbsManager.prototype.getConjugation_en_US = function(verb, tense, person) {
  // console.log( this.compromise(verb).verbs().conjugate() );
  //console.log('TENSE: ' + tense);
  switch(tense) {
    case 'PRESENT':
      if (person!=2) return verb;
      return this.compromise(verb).verbs().toPresentTense().all().out();
    case 'PAST':
      return this.compromise(verb).verbs().toPastTense().all().out();
    case 'FUTURE':
      return this.compromise(verb).verbs().toFutureTense().all().out();
  }
  
};


//- ['TODO', 'TODO', 'TODO', 'TODO', 'TODO', 'TODO']
var verbs_FR = {
  'être': {
    INDICATIF_PASSE_COMPOSE: ['été', 'as été', 'a été', 'avons été', 'avez été', 'ont été']
  },
  'pouvoir': {
    PRESENT: ['TODO', 'TODO', 'peut', 'TODO', 'TODO', 'peuvent']
  },
  'faire': {
    PRESENT: ['TODO', 'TODO', 'fait', 'TODO', 'TODO', 'font']
  }
};

VerbsManager.prototype.getConjugation_fr_FR = function(verb, tense, person) {
  //console.log(verb);
  
  try {
    // we try the exceptions list first
    return verbs_FR[verb][tense][person];
  } catch (e) {

    const tenseMapping = {
      'PRESENT': 'Indicative Present (présent)',
      'INDICATIF_PASSE_COMPOSE': 'Indicative Present perfect (passé composé)'
      // to be completed
    }

    var forms = this.frenchConjugator.getForms();
    // console.log(JSON.stringify(forms));
    var form = forms[ tenseMapping[tense] ];
    
    //console.log(JSON.stringify(form));

    var opts = Object.assign({}, form, 
      { number: person==2 ? "singular" : "plural" },
      { person: "third" }
    );

    //console.log(JSON.stringify(opts));

    return this.frenchConjugator.conjugate(verb, opts);
  }
}


module.exports = {
  VerbsManager
};
