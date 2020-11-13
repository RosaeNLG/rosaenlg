const assert = require('assert');
const italianWords = require('../dist/words.json');

describe('italian-words-dict', function () {
  it('should work', function (done) {
    assert(italianWords != null);
    assert(Object.keys(italianWords).length > 100);
    const pizza = italianWords['pizza'];
    assert(pizza != null);
    assert.strictEqual(pizza['G'], 'F');
    assert.strictEqual(pizza['P'], 'pizze');
    done();
  });
});
