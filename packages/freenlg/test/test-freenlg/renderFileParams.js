var assert = require('assert');
const freenlgPug = require('../../dist/index.js');


const template = `
p
  a(href='https://www.google.com/') Google
  | bla.bla
`;

describe('freenlg', function() {
  describe('renderFileParams', function() {

    it('test without filter', function() {
        let rendered = freenlgPug.render(template, {
          disableFiltering: true,
          language: 'en_US'
        });
        assert.equal(rendered, '<p><a href="https://www.google.com/">Google</a>bla.bla</p>')
    });

    it('no language', function() {
      assert.throws(() => {
        freenlgPug.render(`p`, {
        });  
      }, /language/)
    });
  
    it('alsacian no valid language', function() {
      assert.throws(() => {
        freenlgPug.render(`p`, {
          language: 'alsacian'
        });  
      }, /language/)
    });
    
  });
});
