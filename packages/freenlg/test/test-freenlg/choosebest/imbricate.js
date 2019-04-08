var assert = require('assert');
const freenlgPug = require('../../../dist/index.js');

const oneAfterTheOther = `
p
  choosebest {among:10}
    - for (var i=0; i<2; i++) {
    synz
      syn
        | AAA
      syn
        | BBB
    - }
  choosebest {among:10}
    - for (var i=0; i<2; i++) {
    synz
      syn
        | CCC
      syn
        | DDD
    - }
`;

const imbricate = `
p
  choosebest
    | AAA
    choosebest
      | BBB
`;

function containsAll(rendered, list) {
  for (var i=0; i<list.length; i++) {
    if (!rendered.includes(list[i])) { return false };
  }
  return true;
}

describe('freenlg', function() {
  describe('choosebest', function() {

    it(`one after the other`, function() {
      let rendered = freenlgPug.render(oneAfterTheOther, { language: 'en_US' });
      //console.log(rendered);
      assert( containsAll(rendered, ['AAA', 'BBB', 'CCC', 'DDD']) );
    });

    it(`imbricate`, function() {
      assert.throws(() => freenlgPug.render(imbricate, {language: 'en_US'}), /choosebest cannot be imbricated/)
    });

  });
});

