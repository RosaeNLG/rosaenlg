var assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

// chance to get a good one: 1 * 4/5 * 3/5 * 2/5 * 1/5 = 1/26
const findTheBest = `
p
  choosebest
    | AAA
`;

describe('rosaenlg', function() {
  describe('choosebest', function() {
    it(`no param`, function() {
      assert(rosaenlgPug.render(findTheBest, { language: 'en_US' }).indexOf('AAA') > -1);
    });
  });
});
