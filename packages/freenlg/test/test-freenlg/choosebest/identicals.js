var assert = require('assert');
const freenlgPug = require('../../../dist/index.js');

const largerTest = `
p
  choosebest {among:20, identicals: [ ['diamond', 'diamonds'] ]}
    | diamonds and
    synz
      syn
        | pearl
      syn
        | diamond
`;

describe('freenlg', function() {
  describe('choosebest', function() {

    it(`identicals`, function() {
      const rendered = freenlgPug.render(largerTest, { language: 'en_US' });
      //console.log(rendered);
      assert(
        rendered.indexOf('Diamonds and pearl')>-1
      );
    });
  });
});
