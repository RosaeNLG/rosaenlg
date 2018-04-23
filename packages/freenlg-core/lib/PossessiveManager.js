
function PossessiveManager(params) {
  this.language = params.language;
  this.genderNumberManager = params.genderNumberManager;
  this.refsManager = params.refsManager;
  this.helper = params.helper;

};


module.exports = {
  PossessiveManager
};

/*
  tmp
  owner est probablement plus qu'un booléen : doit porter le possesseur
*/
PossessiveManager.prototype.recipientPossession = function(owned) {
  var nextRef = this.refsManager.getNextRep(owned, {_OWNER: true});
  // console.log('nextRef: ' + 'gender='+getRefGender(nextRef) + ' number='+getRefNumber(nextRef));

  // vos / votre + value of the object
  this.spy.appendPugHtml( 
    `${this.helper.getSorP(['votre', 'vos'], nextRef)} `
  );
  this.spy.getPugMixins().value(owned, {_OWNER: true});

};


/* 
  tmp
  todo plurals
*/
PossessiveManager.prototype.thirdPossession = function(owner, owned, params) {
  this.spy.appendDoubleSpace();

  // on a besoin de savoir si ça va être ref ou ana, mais aussi le genre, le nombre...
  var nextRef = this.refsManager.getNextRep(owner, params);
  //console.log('nextRef: ' + 'gender='+getRefGender(nextRef) + ' number='+getRefNumber(nextRef) + ' REPRESENTANT=' + nextRef.REPRESENTANT);
  if (nextRef.REPRESENTANT == 'ref') {
    // ref not triggered, thus we have to do it
    // FR : osef pluriel ou singulier : la couleur DES diamants

    this.spy.appendPugHtml(`${this.helper.getMorF(['le','la'], owned)} ${owned} ${this.helper.getSorP(['de','des'], nextRef)} `);
    this.spy.getPugMixins().value(owner, params);
  
  } else if (nextRef.REPRESENTANT == 'ana') {
    // ref was already triggered, we only have to manage the possessive
    var number = this.genderNumberManager.getRefNumber(nextRef);
    if (number==null || number=='S') {

      this.spy.appendPugHtml( ` ${this.helper.getMorF(['son','sa'], owned)} ${owned} `);
  
    } else if (number=='P') {
      this.spy.appendPugHtml(' leur ' + owned);
    } else {
      console.log('ERROR thirdPossession internal 2: ' + JSON.stringify(nextRef));
    }
  } else {
    console.log('ERROR thirdPossession internal: ' + JSON.stringify(nextRef));
  }

  this.spy.appendDoubleSpace();  
};

