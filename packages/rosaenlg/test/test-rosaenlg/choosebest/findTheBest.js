/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

function containsAll(rendered, list) {
  for (let i = 0; i < list.length; i++) {
    if (!rendered.includes(list[i])) {
      return false;
    }
  }
  return true;
}

// chance to get a good one: 1 * 4/5 * 3/5 * 2/5 * 1/5 = 1/26
const findTheBest = `
p
  //- var param = {among:100, debug:true}
  choosebest {among:300}
    - for (var i=0; i<5; i++) {
      synz
        syn
          | AAA
        syn
          | BBB
        syn
          | CCC
        syn
          | DDD
        syn
          | EEE
    - }
  //- console.log(JSON.stringify(param.debugRes, null, 2));
`;

const findTheBestDoc = `
p
  | bla
  choosebest {among:100}
    eachz i in [1,2,3] with {separator: ' '}
      synz
        syn
          | stone
        syn
          | jewel
        syn
          | gem
`;

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`is able to find the best`, function () {
      assert(containsAll(rosaenlgPug.render(findTheBest, { language: 'en_US' }), ['AAA', 'BBB', 'CCC', 'DDD', 'EEE']));

      assert(containsAll(rosaenlgPug.render(findTheBestDoc, { language: 'en_US' }), ['stone', 'jewel', 'gem']));
    });
  });
});
