const assert = require('assert');
const TransitiveVerbs = require('../dist/transitive.json');

describe('french-verbs-transitive', function() {
  it('should contain some stuff', function() {
    assert(TransitiveVerbs.length > 50);
    assert(TransitiveVerbs.indexOf('déshalogéner') > -1);
    assert(TransitiveVerbs.indexOf('blabla') == -1);
  });
});
