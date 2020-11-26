/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const lib = require('../dist/index.js');

describe('spanish-adjectives-wrapper', function () {
  describe('#agreeSpanishAdjective()', function () {
    it(`no list`, function () {
      assert.strictEqual(lib.agreeAdjective(null, 'negra', 'F', 'P'), 'negras');
    });
    it(`with list`, function () {
      const grande = lib.getAdjectiveInfo('grande');
      grande['MStrue'] = 'toto';
      assert.strictEqual(lib.agreeAdjective({ grande: grande }, 'grande', 'M', 'S', true), 'toto');
    });
    it(`with invalid list, still finds it`, function () {
      const grande = lib.getAdjectiveInfo('grande');
      delete grande['MStrue'];
      assert.strictEqual(lib.agreeAdjective({ grande: grande }, 'grande', 'M', 'S', true), 'gran');
    });
  });
  describe('#getAdjectiveInfo()', function () {
    it(`gran`, function () {
      const grande = lib.getAdjectiveInfo('grande');
      // console.log(grande);
      assert.strictEqual(grande['MStrue'], 'gran');
      assert.strictEqual(grande['FPfalse'], 'grandes');
    });
  });
});
