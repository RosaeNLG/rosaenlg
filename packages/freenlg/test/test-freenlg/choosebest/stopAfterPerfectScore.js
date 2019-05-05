var assert = require('assert');
const freenlgPug = require('../../../dist/index.js');

const stopAfterPerfectScore = `
p
  - var param = {debug:true, among:100}
  choosebest param
    | AAA
  | #{param.debugRes.perfectScoreAfter}
`;

describe('freenlg', function() {
  describe('choosebest', function() {
    it(`stops whenever perfect score is found`, function() {
      assert(freenlgPug.render(stopAfterPerfectScore, { language: 'en_US' }).indexOf(0) > -1);
    });
  });
});
