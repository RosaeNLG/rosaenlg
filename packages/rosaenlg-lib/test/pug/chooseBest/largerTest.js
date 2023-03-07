/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../../rosaenlg/dist/index.js');

const largerTest = `
p
  choosebest {among:130}
    | AAA
    synz
      syn
        | AAA
      syn
        | BBB
    synz
      syn
        | AAA
      syn
        | BBB
    synz
      syn
        | AAA
      syn
        | BBB
    synz
      syn
        | AAA
      syn
        | BBB
`;

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`larger test`, function () {
      assert(rosaenlgPug.render(largerTest, { language: 'en_US' }).indexOf('AAA BBB AAA BBB AAA') > -1);
    });
  });
});
