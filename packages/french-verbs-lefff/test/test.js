const assert = require('assert');
const LefffVerbs = require('../dist/conjugations.json');

describe('french-verbs-lefff', function() {
  it('should contain something', function() {
    const mangerPresent = LefffVerbs['manger']['P'];
    assert(mangerPresent != null);
    assert.equal(mangerPresent.length, 6);
    assert.equal(mangerPresent[1], 'manges');
  });
});
