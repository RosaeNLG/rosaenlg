/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../../rosaenlg/dist/index.js');

const template = `
p
  | bla
`;

describe('rosaenlg', function () {
  describe('embed elements edge cases', function () {
    it(`lang not set at compile time`, function () {
      assert.throws(() => {
        rosaenlgPug.compileClient(template, {
          compileDebug: false,
          verbs: ['chanter'],
          embedResources: true,
        });
      }, /compile time/);
    });

    it(`invalid verbs for lang`, function () {
      assert.throws(() => {
        rosaenlgPug.compileClient(template, {
          compileDebug: false,
          language: 'de_DE',
          verbs: ['chanter'],
          embedResources: true,
        });
      }, /NotFoundInDict/);
    });

    it(`invalid words for lang`, function () {
      assert.throws(() => {
        rosaenlgPug.compileClient(template, {
          compileDebug: false,
          language: 'nl_NL',
          words: ['blabla'],
          embedResources: true,
        });
      }, /getWordInfo/);
    });

    it(`invalid adjs for lang`, function () {
      assert.throws(() => {
        rosaenlgPug.compileClient(template, {
          compileDebug: false,
          language: 'en_US',
          adjectives: ['blabla'],
          embedResources: true,
        });
      }, /getAdjectiveInfo/);
    });
  });
});
