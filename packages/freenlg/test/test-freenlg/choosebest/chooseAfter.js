var assert = require('assert');
const freenlgPug = require('../../../dist/index.js');

const chooseAfter = `
p
  choosebest {among:10}
    | AAA
    synz
      syn
        | AAA
      syn
        | BBB
`;

describe('freenlg', function() {
  describe('choosebest', function() {

    it(`choice after a first text is set`, function() {
      assert(
        freenlgPug.render(chooseAfter, { language: 'en_US' }).indexOf('AAA BBB')>-1
      );
    });
  });
});

