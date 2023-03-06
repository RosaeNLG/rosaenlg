/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgLib = require('rosaenlg-lib');

describe('version', function () {
  it(`should have a version`, function () {
    const version = rosaenlgLib.getRosaeNlgVersion();
    assert(version);
  });
});
