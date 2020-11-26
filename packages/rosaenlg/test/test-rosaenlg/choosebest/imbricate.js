/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

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
  for (let i = 0; i < list.length; i++) {
    if (!rendered.includes(list[i])) {
      return false;
    }
  }
  return true;
}

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`one after the other`, function () {
      const rendered = rosaenlgPug.render(oneAfterTheOther, { language: 'en_US' });
      //console.log(rendered);
      assert(containsAll(rendered, ['AAA', 'BBB', 'CCC', 'DDD']));
    });

    it(`imbricate`, function () {
      assert.throws(() => rosaenlgPug.render(imbricate, { language: 'en_US' }), /choosebest cannot be imbricated/);
    });
  });
});
