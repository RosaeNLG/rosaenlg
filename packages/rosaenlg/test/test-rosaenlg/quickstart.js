const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const template = `
test
  eachz fruit in data with { separator: ',', last_separator: 'and' }
    | #{fruit}
`;

describe('rosaenlg', function() {
  describe('quickstart', function() {
    const rendered = rosaenlgPug.render(template, {
      language: 'en_US',
      data: ['apples', 'bananas', 'apricots'],
    });

    it('test quickstart with render', function() {
      assert.equal(rendered, '<test>Apples, bananas and apricots</test>');
    });
  });
});
