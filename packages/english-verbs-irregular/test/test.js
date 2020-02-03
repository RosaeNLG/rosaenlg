const assert = require('assert');
const EnglishIrregularVerbs = require('../dist/verbs.json');

describe('english-irregular-verbs', function() {
  it('sleep', function() {
    const sleep = EnglishIrregularVerbs['sleep'];
    assert(sleep != null);
    assert.equal(sleep.length, 1);
    assert.equal('slept', sleep[0][0]);
    assert.equal('slept', sleep[0][1]);
  });
  it('wake', function() {
    const wake = EnglishIrregularVerbs['wake'];
    assert(wake != null);
    assert.equal(wake.length, 2);
    assert.equal('woke', wake[0][0]);
    assert.equal('woken', wake[0][1]);
    assert.equal('waked', wake[1][0]);
    assert.equal('waked', wake[1][1]);
  });
  it('bid', function() {
    const bid = EnglishIrregularVerbs['bid'];
    assert(bid != null);
    assert.equal(bid.length, 3);
  });
  it('shit', function() {
    const shit = EnglishIrregularVerbs['shit'];
    assert(shit != null);
    assert.equal(shit.length, 3);
  });
});
