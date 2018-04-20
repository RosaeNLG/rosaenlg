



function Helper() {

};


Helper.prototype.isSentenceStart = function() {
  /*
    .   xxxx
    .xxx
    ne marche pas sur les inline

    > xxxx
    >xxx
    attention car n'est pas vrai sur tous les tags : </b> ne marque pas une fin de phrase
  */

  // console.log("last characters: [" + pug_html.substr(pug_html.length - 6) + ']');
  if ( /\.\s*$/.test( this.spy.getPugHtml() ) ) {
    return true;
  }
  if ( />\s*$/.test( this.spy.getPugHtml() ) ) {
    return true;
  }

  return false;

};


Helper.prototype.getUppercaseWords = function(str) {
  if (str!=null && str.length > 0) {
    if (this.spy.isEvaluatingEmpty()) {
      return 'SOME_WORDS';
    } else {
      return str.replace(/\b\w/g, l => l.toUpperCase());
    }
  }
};

Helper.prototype.hasFlag = function(params, flag) {
  if (flag==null) {
    console.log('ERROR: hasFlag must be called with a flag param!');
  }
  if (params!=null && params[flag]==true) {
    return true;
  } else {
    return false;
  }
};

Helper.prototype.getFlagValue = function(params, flag) {
  if (flag==null) {
    console.log('ERROR: getFlagValue must be called with a flag param!');
  }
  if (params!=null) {
    return params[flag];
  } else {
    return null;
  }
};

Helper.prototype.protectString = function(string) {
  return '§' + string + '§';
};


module.exports = {
  Helper
};
