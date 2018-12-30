var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();


const template = `
p
  a(href='https://www.google.com/') Google
  | bla.bla
`;


module.exports = it => {

  let rendered = freenlgPug.render(template, {
    //language: 'en_US',
    disableFiltering: true
  });

  it('test without filter', () => it.eq( rendered, 
      '<p><a href="https://www.google.com/">Google</a>bla.bla</p>'
    ));

}
