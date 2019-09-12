const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

const chooseBefore = `
p
  choosebest {among:50}
    synz
      syn
        | AAA
      syn
        | BBB
    | AAA
`;

describe('rosaenlg', function() {
  describe('choosebest', function() {
    it(`choice before a static text`, function() {
      assert(rosaenlgPug.render(chooseBefore, { language: 'en_US' }).indexOf('BBB AAA') > -1);
    });
  });
});
