var assert = require('assert');
const freenlgPug = require('../lib/index.js');


const template = `
p
  a(href='https://www.google.com/') Google
  | bla.bla
`;

describe('freenlg', function() {
  describe('renderFileParams', function() {
    let rendered = freenlgPug.render(template, {
      //language: 'en_US',
      disableFiltering: true
    });
  
    it('test without filter', function() {
        assert.equal(rendered, '<p><a href="https://www.google.com/">Google</a>bla.bla</p>')
      });

  });
});
