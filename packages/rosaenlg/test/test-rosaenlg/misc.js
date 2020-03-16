const assert = require('assert');
const rosaenlg = require('../../dist/NlgLib.js');

describe('misc', function() {
  it(`should have a version`, function() {
    const version = rosaenlg.getRosaeNlgVersion();
    assert(version);
  });
});
