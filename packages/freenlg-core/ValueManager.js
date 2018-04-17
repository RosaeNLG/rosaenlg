const helper = require("./helper");


function ValueManager(params) {
  this.language = params.language;

  if (this.language=='en_US') {
    this.compromise = require('compromise');
  } else if (this.language=='fr_FR') {
    this.formatNumber = require('format-number-french');
  }

}

ValueManager.prototype.valueNumber = function(val, params, envParams) {
  if (envParams.isEvaluatingEmpty) {
    return 'SOME_NUMBER';
  } else {
    if (helper.hasFlag(params, 'AS_IS')) {
      return val;
    } else if (helper.hasFlag(params, 'TEXTUAL')) {
      switch (this.language) {
        case 'en_US':
          return this.compromise(val).values().toText().all().out();
          break;
        case 'fr_FR':
          console.log('ERROR: TEXTUAL in value not implemented in fr_FR');
          return val;
          break;
      }
    } else if (helper.hasFlag(params, 'ORDINAL_NUMBER')) {
      switch (this.language) {
        case 'en_US':
          return this.compromise(val).values().toOrdinal().all().out();
          break;
        case 'fr_FR':
          console.log('ERROR: ORDINAL_NUMBER in value not implemented in fr_FR');
          return val;
          break;
      }
    } else if (helper.hasFlag(params, 'ORDINAL_TEXTUAL')) {
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
          return helper.protectString( this.compromise(val).values().toNice().all().out() );
        case 'fr_FR':
          // format-number-french: expects "string of numbers and may contain one coma"
          var valAsString = val.toString().replace('.', ',');
          return helper.protectString( this.formatNumber( valAsString, params ) );
      }
    }
  }
};



module.exports = {
  ValueManager
};
