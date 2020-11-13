const assert = require('assert');
const lib = require('../dist/index.js');

const testCases = [
  [1, 'first'],
  [2, 'second'],
  [20, 'twentieth'],
  [67, 'sixty-seventh'],
  [100, 'one hundredth'],
  [134534, 'one hundred and thirty-four thousand five hundred and thirty-fourth'],
];

describe('english-ordinals', function () {
  describe('#getOrdinal()', function () {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase[0]} => ${testCase[1]}`, function () {
        assert.strictEqual(lib.getOrdinal(testCase[0]), testCase[1]);
      });
    }
  });
});
