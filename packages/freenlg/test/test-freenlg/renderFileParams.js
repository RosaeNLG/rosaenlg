var assert = require('assert');
const freenlgPug = require('../../dist/index.js');


const template = `
p
  a(href='https://www.google.com/') Google
  | bla.bla
`;

describe('freenlg', function() {
  describe('renderFileParams', function() {
    let rendered = freenlgPug.render(template, {
      disableFiltering: true
    });
  
    it('test without filter', function() {
        assert.equal(rendered, '<p><a href="https://www.google.com/">Google</a>bla.bla</p>')
      });

  });

  describe('language does not exist', function() {
    let rendered = freenlgPug.render(`p`, {
      language: 'alsacian'
    });
  
    it('alsacian no valid language', function() {
        assert.equal(rendered, '<p></p>')
      });

  });
});
