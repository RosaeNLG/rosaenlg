const assert = require('assert');
const rosaenlg = require('rosaenlg');

function check(lang, testCaseFileName) {
  const params = {
    language: lang,
  };
  const rendered = rosaenlg.renderFile(`test/${testCaseFileName}.pug`, params);

  const withoutEnglobing = rendered.replace(/^<t><l>/, '').replace(/<\/l><\/t>$/, '');
  const renderedChunks = withoutEnglobing.split('</l><l>');
  //console.log(renderedChunks);

  const expected = [];
  const lines = params.util.expected.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() != '') {
      expected.push(lines[i].trim());
    }
  }
  it(`check size expected ${expected.length} vs real ${renderedChunks.length}`, function () {
    assert.strictEqual(expected.length, renderedChunks.length, `expected: ${expected}, rendered: ${renderedChunks}`);
  });
  for (let i = 0; i < expected.length; i++) {
    it(expected[i], function () {
      // we have to trim as .<l/> generates a space after
      assert.strictEqual(renderedChunks[i].trim(), expected[i]);
    });
  }
}

describe('rosaenlg-countries', function () {
  describe('fr_FR', function () {
    check('fr_FR', 'test_fr_FR');
  });
  describe('en_US', function () {
    check('en_US', 'test_en_US');
  });
});
