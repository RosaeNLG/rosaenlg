/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');

const largerTest = `
p
  choosebest {among:20, identicals: [ ['diamond', 'diamonds'] ]}
    | diamonds and
    synz
      syn
        | pearl
      syn
        | diamond
`;

describe('rosaenlg', function () {
  describe('choosebest', function () {
    it(`identicals`, function () {
      const rendered = rosaenlgPug.render(largerTest, { language: 'en_US' });
      //console.log(rendered);
      assert(rendered.indexOf('Diamonds and pearl') > -1);
    });
  });
});
