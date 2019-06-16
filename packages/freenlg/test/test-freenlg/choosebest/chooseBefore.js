var assert = require('assert');
const freenlgPug = require('../../../dist/index.js');

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

describe('freenlg', function() {
  describe('choosebest', function() {
    it(`choice before a static text`, function() {
      assert(freenlgPug.render(chooseBefore, { language: 'en_US' }).indexOf('BBB AAA') > -1);
    });
  });
});
