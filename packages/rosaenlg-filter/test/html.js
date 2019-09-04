const html = require('../dist/html.js');
const assert = require('assert');

let testCases = [
  ['<b>bla</b>', '☞bla☜', ['<b>', '</b>']],
  ['<div>bla</div>', '☛bla☚', ['<div>', '</div>']],
  ['<span class="test">bla</span>', '☞bla☜', ['<span class="test">', '</span>']],
  [
    '<span class="test">bla<b> bli </b> blu</span>',
    '☞bla☞ bli ☜ blu☜',
    ['<span class="test">', '<b>', '</b>', '</span>'],
  ],
  ['<x>bla</x>', '☞bla☜', ['<x>', '</x>']],
];

describe('rosaenlg-filter', function() {
  describe('html', function() {
    describe('nominal', function() {
      for (let i = 0; i < testCases.length; i++) {
        let testCase = testCases[i];
        let input = testCase[0];
        let replacedExpected = testCase[1];
        let eltsExpected = testCase[2];
        describe(`${input}`, function() {
          let resHtml = html.replaceHtml(input);
          it(`replaceHtml`, function() {
            assert.equal(resHtml.replaced, replacedExpected);
            assert.deepEqual(resHtml.elts, eltsExpected);
          });
          let resPlaceholders = html.replacePlaceholders(resHtml.replaced, [...resHtml.elts]);
          it(`replacePlaceholders`, function() {
            assert.equal(resPlaceholders, input);
          });
        });
      }
    });

    describe('edge', function() {
      it(`not enough tags`, function() {
        assert.throws(() => html.replacePlaceholders('☞☞☜☜', ['<a>', '</a>']), /not enough/);
      });
      it(`left tags`, function() {
        assert.throws(() => html.replacePlaceholders('☞', ['<a>', '</a>']), /left html/);
      });
    });
  });
});
