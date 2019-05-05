var assert = require('assert');
const freenlgPug = require('../../../dist/index.js');

const largerTest = `
p
  choosebest {among:80}
    | AAA
    synz
      syn
        | AAA
      syn
        | BBB
    synz
      syn
        | AAA
      syn
        | BBB
    synz
      syn
        | AAA
      syn
        | BBB
    synz
      syn
        | AAA
      syn
        | BBB
`;

describe('freenlg', function() {
  describe('choosebest', function() {
    it(`larger test`, function() {
      assert(freenlgPug.render(largerTest, { language: 'en_US' }).indexOf('AAA BBB AAA BBB AAA') > -1);
    });
  });
});
