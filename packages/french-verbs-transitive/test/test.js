/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const transitiveVerbs = require('../dist/transitive.json');

describe('french-verbs-transitive', function () {
  it('should have some length', function () {
    assert(transitiveVerbs.length > 50);
  });
  it('should contain some useful stuff like "déshalogéner"', function () {
    assert(transitiveVerbs.indexOf('déshalogéner') > -1);
  });
  it('should contain "manger"', function () {
    assert(transitiveVerbs.indexOf('manger') > -1);
  });
  it('should not contain stuff like "blabla"', function () {
    assert(transitiveVerbs.indexOf('blabla') == -1);
  });
});
