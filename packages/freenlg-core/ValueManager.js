
function ValueManager(params) {
  this.language = params.language;
  this.refsManager = params.refsManager;
  this.randomManager = params.randomManager;
  this.helper = params.helper;

  if (this.language=='en_US') {
    this.compromise = require('compromise');
  } else if (this.language=='fr_FR') {
    this.formatNumber = require('format-number-french');
  }

};

ValueManager.prototype.value = function(obj, params) {
  if (typeof(obj) === 'number') {
    this.spy.appendPugHtml( this.valueNumber(obj, params) );
  } else if (typeof(obj) === 'string') {
    this.spy.appendPugHtml( this.valueString(obj, params) );    
  } else if (typeof(obj) === 'object') {
    // it calls mixins, it already appends
    this.valueObject(obj, params);
  } else {
    console.log('ERROR: value not possible on: ' + JSON.stringify(obj));
  }
};

ValueManager.prototype.valueString = function(val, params) {
  return this.spy.isEvaluatingEmpty() ? 'SOME_STRING' : val;
};

ValueManager.prototype.valueObject = function(obj, params) {

  // console.log(obj);
  
  //- we already have the next one
  if (this.refsManager.getNextRef(obj)!=null) {
    //console.log('we already have the next one');
    this.randomManager.rndNextPos = this.refsManager.getNextRef(obj).rndNextPos;
    this.refsManager.deleteNextRef(obj);
  }

  if ( this.helper.getFlagValue(params, 'REPRESENTANT')=='ref' ) {
    this.valueRef(obj, params);
  } else if ( this.helper.getFlagValue(params, 'REPRESENTANT')=='ana' ) {
    this.valueAna(obj, params);
  } else
    if ( !this.refsManager.hasTriggeredRef(obj) ) {
      this.valueRef(obj, params);
    } else if (obj.ana) {
      this.valueAna(obj, params);
    } else {
      //- we trigger ref if obj has no ana
      this.valueRef(obj, params);
    }
};

ValueManager.prototype.valueAna = function(obj, params) {
  //- console.log('ana: ' + JSON.stringify(params));
  if (obj.ana) {
    this.spy.getPugMixins()[obj.ana](obj, params);
  } else {
    console.log('ERROR: ' + obj + ' has no ana mixin');
    this.spy.getPugMixins().insertVal(obj.toString());
  }
};

ValueManager.prototype.valueRef = function(obj, params) {
  //- printObj('value_ref', obj)
  if (obj.ref) {
    // console.log('value_ref_ok: ' + obj.ref);
    this.spy.getPugMixins()[obj.ref](obj, params);
    this.refsManager.setTriggeredRef(obj);
  } else {
    console.log('ERROR: ' + JSON.stringify(obj) + ' has no ref mixin');
    this.spy.getPugMixins().insertVal(obj.toString());
  }
};


ValueManager.prototype.valueNumber = function(val, params) {
  if (this.spy.isEvaluatingEmpty()) {
    return 'SOME_NUMBER';
  } else {
    if (this.helper.hasFlag(params, 'AS_IS')) {
      return val;
    } else if (this.helper.hasFlag(params, 'TEXTUAL')) {
      switch (this.language) {
        case 'en_US':
          return this.compromise(val).values().toText().all().out();
          break;
        case 'fr_FR':
          console.log('ERROR: TEXTUAL in value not implemented in fr_FR');
          return val;
          break;
      }
    } else if (this.helper.hasFlag(params, 'ORDINAL_NUMBER')) {
      switch (this.language) {
        case 'en_US':
          return this.compromise(val).values().toOrdinal().all().out();
          break;
        case 'fr_FR':
          console.log('ERROR: ORDINAL_NUMBER in value not implemented in fr_FR');
          return val;
          break;
      }
    } else if (this.helper.hasFlag(params, 'ORDINAL_TEXTUAL')) {
      switch (this.language) {
        case 'en_US':
          return this.compromise(val).values().toText().all().values().toOrdinal().all().out();
          break
        case 'fr_FR':
          console.log('ERROR: ORDINAL_TEXTUAL in value not implemented in fr_FR');
          return val;
          break;
        }
    } else {
      switch (this.language) {
        case 'en_US':
          return this.helper.protectString( this.compromise(val).values().toNice().all().out() );
        case 'fr_FR':
          // format-number-french: expects "string of numbers and may contain one coma"
          var valAsString = val.toString().replace('.', ',');
          return this.helper.protectString( this.formatNumber( valAsString, params ) );
      }
    }
  }
};



module.exports = {
  ValueManager
};
