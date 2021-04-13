/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const TransitiveVerbs = require('../dist/transitive.json');

describe('french-verbs-transitive', function () {
  it('should have some length', function () {
    assert(TransitiveVerbs.length > 50);
  });
  it('should contain some useful stuff like "déshalogéner"', function () {
    assert(TransitiveVerbs.indexOf('déshalogéner') > -1);
  });
  it('should not contain stuff like "blabla"', function () {
    assert(TransitiveVerbs.indexOf('blabla') == -1);
  });
});
