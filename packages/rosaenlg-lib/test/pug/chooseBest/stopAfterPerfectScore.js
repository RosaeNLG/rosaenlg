/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../../rosaenlg/dist/index.js');

const stopAfterPerfectScore = `
p
  - var param = {debug:true, among:100}
  choosebest param
    | AAA
  | #{param.debugRes.perfectScoreAfter}
`;

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`stops whenever perfect score is found`, function () {
      assert(rosaenlgPug.render(stopAfterPerfectScore, { language: 'en_US' }).indexOf(0) > -1);
    });
  });
});
