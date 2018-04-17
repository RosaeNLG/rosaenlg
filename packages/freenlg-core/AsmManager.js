


function AsmManager(params) {
  this.randomManager = params.randomManager;

};


AsmManager.prototype.checkAsm = function(asm) {
  if ( asm==null || asm.mode==null || ['single_sentence', 'sentences', 'paragraphs'].indexOf(asm.mode)>-1 ) {
    // ok
  } else {
    console.log('WARNING asm mode is not valid: ' + asm.mode);
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

