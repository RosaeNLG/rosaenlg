var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();


const template = `
test
  eachz fruit in data with { separator: ',', last_separator: 'and' }
    | #{fruit}
`;


module.exports = it => {
  let rendered = freenlgPug.render(template, {
    language: 'en_US',
    data: ['apples', 'bananas', 'apricots']
  });

  it('test quickstart with render', () => it.eq( rendered, '<test>apples, bananas and apricots</test>'));

}
