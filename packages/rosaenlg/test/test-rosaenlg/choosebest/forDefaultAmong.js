/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

const forDefaultAmong = `
p
  - var param = {debug:true}
  choosebest param
    | AAA AAA
  | #{param.debugRes.maxTest}
`;

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`general default among`, function () {
      assert(rosaenlgPug.render(forDefaultAmong, { language: 'en_US' }).indexOf(5) > -1);
    });

    it(`override globally default among`, function () {
      assert(rosaenlgPug.render(forDefaultAmong, { language: 'en_US', defaultAmong: 10 }).indexOf(10) > -1);
    });
  });
});
