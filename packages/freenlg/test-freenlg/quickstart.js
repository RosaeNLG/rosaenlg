var assert = require('assert');
const freenlgPug = require('../lib/index.js');

const template = `
test
  eachz fruit in data with { separator: ',', last_separator: 'and' }
    | #{fruit}
`;


describe('french-ordinals', function() {
  describe('quickstart', function() {

    let rendered = freenlgPug.render(template, {
      language: 'en_US',
      data: ['apples', 'bananas', 'apricots']
    });
    
    it('test quickstart with render', function() {
      assert.equal(rendered, '<test>apples, bananas and apricots</test>')
    });

  });
});
