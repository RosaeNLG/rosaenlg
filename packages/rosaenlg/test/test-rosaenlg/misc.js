/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgLib = require('../../dist/NlgLib.js');
const rosaenlg = require('../../dist/index.js');

describe('misc', function () {
  it(`should have a version`, function () {
    const version = rosaenlgLib.getRosaeNlgVersion();
    assert(version);
  });
  it(`value date without params`, function () {
    const rendered = rosaenlg.render(`+value(new Date(1980, 3, 14))`, { language: 'en_US' });
    assert.strictEqual(rendered, '1980-04-14');
  });
});
