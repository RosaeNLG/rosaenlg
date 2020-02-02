const assert = require('assert');
const germanWords = require('../dist/words.json');

describe('german-words-dict', function() {
  it('should work', function(done) {
    assert(germanWords != null);
    assert(Object.keys(germanWords).length > 100);
    const kartoffel = germanWords['Kartoffel'];
    assert(kartoffel != null);
    assert.equal(kartoffel['G'], 'F');
    assert.equal(kartoffel['DAT']['PLU'], 'Kartoffeln');
    done();
  });
});
