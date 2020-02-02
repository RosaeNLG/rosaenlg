const assert = require('assert');
const italianVerbs = require('../dist/verbs.json');

describe('italian-verbs-dict', function() {
  it('should work', function(done) {
    assert(italianVerbs != null);
    assert(Object.keys(italianVerbs).length > 100);

    const mangiare = italianVerbs['mangiare'];
    assert(mangiare != null);
    assert.equal(mangiare['ind']['pres']['P1'], 'mangiamo');

    const abbacchiare = italianVerbs['abbacchiare'];
    assert(abbacchiare != null);
    assert.equal(abbacchiare['inf']['pres'], 'abbacchiare');

    done();
  });
});
