/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

const chooseAfter = `
p
  choosebest {among:10}
    | AAA
    synz
      syn
        | AAA
      syn
        | BBB
`;

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`choice after a first text is set`, function () {
      assert(rosaenlgPug.render(chooseAfter, { language: 'en_US' }).indexOf('AAA BBB') > -1);
    });
  });
});
