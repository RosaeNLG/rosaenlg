const assert = require('assert');
const germanVerbs = require('../dist/verbs.json');

describe('german-verbs-dict', function() {
  it('should work', function(done) {
    assert(germanVerbs != null);
    assert(Object.keys(germanVerbs).length > 100);
    const horen = germanVerbs['hören'];
    assert(horen != null);
    assert.equal(horen['PRT']['S'][1], 'hörte');
    done();
  });
});
