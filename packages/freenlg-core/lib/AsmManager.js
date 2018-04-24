


function AsmManager(params) {
  this.saveRollbackManager = params.saveRollbackManager;
  this.randomManager = params.randomManager;

};


//-------------- HELPERS, COMMON

AsmManager.prototype.foreach = function(elts, mixinFct, asm, params) {
  this.checkAsm(asm);
  var targetMixin = mixinFct!=null ? mixinFct : "value";
  // console.log('aaaa' + targetMixin);

  // start
  this.saveRollbackManager.saveSituation({context:'isEmpty'});

  var nonEmptyElts = [];


  // we have to shuffle BEFORE testing
  var eltsToTest = [];
  for (var i=0; i<elts.length; i++) {
    eltsToTest.push(i);
  }
  if (asm!=null && asm.shuffle==true) {
    this.shuffle(eltsToTest);
  }

  for (var i=0; i<eltsToTest.length; i++) {
    var elt = elts[i];
    if (!this.mixinIsEmpty(targetMixin, elt, params)) {
      nonEmptyElts.push(elt);
    }
  }

  this.saveRollbackManager.rollback();

  this.listStuff(targetMixin, nonEmptyElts, asm, params);
};


AsmManager.prototype.assemble = function(which, asm, size, params) {
  this.checkAsm(asm);
  //console.log("START ASSEMBLE");
  
  var nonEmpty = [];

  // we have to shuffle BEFORE testing
  var eltsToTest = [];
  for (var i=1; i<=size; i++) {
    eltsToTest.push(i);
  }
  //console.log("before shuffle: " + eltsToTest);
  if (asm!=null && asm.shuffle==true) {
    this.shuffle(eltsToTest);
  }
  //console.log("after shuffle: " + eltsToTest);

  // start
  this.saveRollbackManager.saveSituation({context:'isEmpty'});
  

  for (var i=0; i<size; i++) {
    if (!this.mixinIsEmpty(which, eltsToTest[i], params)) {
      nonEmpty.push(eltsToTest[i]);
    }
  }
  //console.log("nonEmpty: " + nonEmpty);

  // rollback
  // pug_html = html_before;
  this.saveRollbackManager.rollback();

  this.listStuff(which, nonEmpty, asm, params);

};

AsmManager.prototype.mixinIsEmpty = function(mixinFct, param1, params) {
  
  var html_before = this.spy.getPugHtml();

  try {
    this.spy.getPugMixins()[mixinFct](param1, params);
  } catch (e) {
    throw e;
  }

  // test
  //console.log('before: ' + html_before);
  //console.log('after: ' + pug_html);
  var isEmpty = html_before==this.spy.getPugHtml() ? true : false;

  return isEmpty;
}


AsmManager.prototype.listStuff = function(which, nonEmpty, asm, params) {
  // call one or the other
  var toCall = asm!=null && ( asm.mode=='sentences' || asm.mode=='paragraphs' ) ? 'listStuffSentences' : 'listStuffSingleSentence';
  this[toCall](which, nonEmpty, asm, params);
};

AsmManager.prototype.isMixin = function(name) {
  return this.spy.getPugMixins()[name]!=null ? true : false;
};


AsmManager.prototype.outputStringOrMixin_helper = function(name, params) {
  if ( this.isMixin(name) ) {
    this.spy.getPugMixins()[name](params);
  } else {
    this.spy.getPugMixins()['insertVal'](name);
  }
};


AsmManager.prototype.positions = {
  BEGIN: Symbol('POS_BEGIN'),
  END: Symbol('POS_END'),
  SEP: Symbol('POS_SEP'),
  OTHER: Symbol('POS_OTHER')
};


AsmManager.prototype.outputStringOrMixin = function(name, position, params) {
  /*
    should add spaces BEFORE AND AFTER if not present:
      last_separator
      separator
    should add a space AFTER if not present:
      begin_with_general
      begin_with_1
    should add space BEFORE if not present:
      end
  */
  switch(position) {
    case this.positions.BEGIN:
      this.outputStringOrMixin_helper(name, params);
      this.spy.appendDoubleSpace();
      break;
    case this.positions.END:
      this.spy.appendDoubleSpace();
      this.outputStringOrMixin_helper(name, params);
      break;
    case this.positions.SEP:
      this.spy.appendDoubleSpace();
      this.outputStringOrMixin_helper(name, params);
      this.spy.appendDoubleSpace();
      break;
    case this.positions.OTHER:
      this.outputStringOrMixin_helper(name, params);
      break;
  }
};

AsmManager.prototype.checkAsm = function(asm) {
  if ( asm==null || asm.mode==null || ['single_sentence', 'sentences', 'paragraphs'].indexOf(asm.mode)>-1 ) {
    // ok
  } else {
    console.log('WARNING asm mode is not valid: ' + asm.mode);
  }
};


//-------------- MULTIPLE SENTENCES


AsmManager.prototype.isDot = function(str) {
  return /^\s*\.\s*$/.test(str);
};

AsmManager.prototype.getBeginWith = function(param, index) {
  if (param==null) {
    return null;
  } else if (typeof param === 'string' || param instanceof String) {
    //- if it is a string: we take it, but only once
    //- if it is a mixin: we take it each time
    if (index==0 || this.isMixin(param)) {
      return param;
    } else {
      return null;
    }
  } else if (param instanceof Array) {
    if (index < param.length) {
      return param[index];
    } else {
      return null;
    }
  }
  console.log('WARNING invalid getBeginWith: ' + param);
};

AsmManager.prototype.listStuffSentences_helper = function(beginWith, params, elt, which, asm, index, size) {
  if (beginWith!=null) {
    this.outputStringOrMixin(beginWith, this.positions.BEGIN, params);
  }
  this.spy.getPugMixins()[which](elt, params);
  this.insertSeparatorSentences(asm, index, size, params);
  //- could set pTriggered to true but no read afterwards
};


AsmManager.prototype.insertSeparatorSentences = function(asm, index, size, params) {
  //- at the end, after the last output
  if (index+1==size) {
    if (asm.separator) {
      //- we try to avoid </p>. in the output
      if (!this.isDot(asm.separator)) {
        this.outputStringOrMixin(asm.separator, this.positions.END, params);
      } else {
        // pug_mixins.flushBuffer(); <= was this really useful?
        if (!this.spy.getPugHtml().endsWith('</p>')) {
          //-| #{'|'+getBufferLastChars(4)+'|'}
          //- console.log('XXXXXXXXXXX');
          this.outputStringOrMixin(asm.separator, this.positions.OTHER, params);
        }
      }
    }
  } else if (index+1==size-1) {
    if (asm.last_separator) {
      this.outputStringOrMixin(asm.last_separator, this.positions.SEP, params);
    } else if (asm.separator) {
      this.outputStringOrMixin(asm.separator, this.positions.SEP, params);
    }
  //- normal one
  } else if (index+1<size-1 && asm.separator) {
    this.outputStringOrMixin(asm.separator, this.positions.SEP, params);
  }
};


AsmManager.prototype.listStuffSentences = function(which, nonEmpty, asm, params) {
  // console.log(nonEmpty);
  var size = nonEmpty.length;

  if (!params) params = {};
  // make it available in params
  params.nonEmpty = nonEmpty;

  if (nonEmpty.length==0 && asm!=null && asm.if_empty!=null) {
    this.outputStringOrMixin(asm.if_empty, this.positions.OTHER, params);
  }
  
  for (var index=0; index<nonEmpty.length; index++) {

    //- begin
    var beginWith = null;
    if (asm!=null) {
      if (index==0) {
        if (asm.begin_with_1!=null && nonEmpty.length==1) {
          beginWith = asm.begin_with_1;
        } else if (asm.begin_with_general!=null) {
          beginWith = this.getBeginWith(asm.begin_with_general, 0);
        }
      } else if (index==size-2) {
        if (asm.begin_last_1!=null) {
          beginWith = asm.begin_last_1;
        } else {
          beginWith = this.getBeginWith(asm.begin_with_general, index);
        }        
      } else if (index==size-1) {
        if (asm.begin_last!=null) {
          beginWith = asm.begin_last;
        } else {
          beginWith = this.getBeginWith(asm.begin_with_general, index);
        }
      } else {
        beginWith = this.getBeginWith(asm.begin_with_general, index);
      }
    }
    
    //- the actual content
    //- console.log(asm);

    if (asm!=null && asm.mode=='paragraphs') {
      this.spy.getPugMixins().insertValUnescaped('<p>');
      this.listStuffSentences_helper(beginWith, params, nonEmpty[index], which, asm, index, size);
      this.spy.getPugMixins().insertValUnescaped('</p>');
    } else {
      this.spy.appendDoubleSpace();
      this.listStuffSentences_helper(beginWith, params, nonEmpty[index], which, asm, index, size);
      this.spy.appendDoubleSpace();
    }

    //-end
    if (index==size-1) {
      if (asm.end!=null && this.isDot(asm.end)) {
        console.log('WARNING: when assembles is paragraph, the end is ignored when it is a dot.');
      }
    }
  }

};


//-------------- SINGLE SENTENCE

AsmManager.prototype.insertSeparatorSingleSentence = function(asm, index, size, params) {
  if (asm) {
    //- last separator
    if (index+1==size-1) {
      if (asm.last_separator) {
        this.outputStringOrMixin(asm.last_separator, this.positions.SEP, params);
      } else if (asm.separator) {
        this.outputStringOrMixin(asm.separator, this.positions.SEP, params);
      }
    //- normal one
    } else if (index+1<size-1 && asm.separator) {
      this.outputStringOrMixin(asm.separator, this.positions.SEP, params);
    }
  }
};

AsmManager.prototype.listStuffSingleSentence = function(which, nonEmpty, asm, params) {

  var size = nonEmpty.length;

  if (!params) params = {};
  // make it available in params
  params.nonEmpty = nonEmpty;

  if (nonEmpty.length==0 && asm!=null && asm.if_empty!=null) {
    this.outputStringOrMixin(asm.if_empty, this.positions.OTHER, params);
  }

  for (var index=0; index<nonEmpty.length; index++) {

    //- begin
    var beginWith = null; // strange to have to put null here
    if (index==0 && asm!=null) {
      if (asm.begin_with_1!=null && nonEmpty.length==1) {
        beginWith = asm.begin_with_1;
      } else if (asm.begin_with_general!=null) {
        beginWith = asm.begin_with_general;
      }
    }
    
    //- the actual content
    if (beginWith!=null) {
      this.outputStringOrMixin(beginWith, this.positions.BEGIN, params);
    }

    this.spy.appendDoubleSpace();
    this.spy.appendDoubleSpace();
    this.spy.getPugMixins()[which](nonEmpty[index], params);
    this.spy.appendDoubleSpace();
    this.insertSeparatorSingleSentence(asm, index, size, params);

    //-end
    if (index==size-1) {
      if (asm!=null && asm.end!=null) {
        this.outputStringOrMixin(asm.end, this.positions.END, params);
      }
    }
  }
};


/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
AsmManager.prototype.shuffle = function(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomManager.getNextRnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
}


module.exports = {
  AsmManager
};

