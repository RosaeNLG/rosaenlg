var assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const template = `
p
  a(href='https://www.google.com/') Google
  | bla.bla
`;

describe('rosaenlg', function() {
  describe('renderFileParams', function() {
    it('test without filter', function() {
      let rendered = rosaenlgPug.render(template, {
        disableFiltering: true,
        language: 'en_US',
      });
      assert.equal(rendered, '<p><a href="https://www.google.com/">Google</a>bla.bla</p>');
    });

    it('no language', function() {
      assert.throws(() => {
        rosaenlgPug.render(`p`, {});
      }, /language/);
    });
  });
});
