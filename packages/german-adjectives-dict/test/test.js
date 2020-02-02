const assert = require('assert');
const germanAdjectives = require('../dist/adjectives.json');

describe('german-adjectives-dict', function() {
  it('should work', function(done) {
    assert(germanAdjectives != null);
    assert(Object.keys(germanAdjectives).length > 100);
    const schon = germanAdjectives['schön'];
    assert(schon != null);
    assert.equal(schon['AKK']['IND']['N'], 'schönes');
    done();
  });
});
