/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const IntransitiveVerbs = require('../dist/intransitive.json');

describe('french-verbs-intransitive', function () {
  it('should have a certain length', function () {
    assert(IntransitiveVerbs.length > 50);
  });
  it('should contain apparaître', function () {
    assert(IntransitiveVerbs.indexOf('apparaître') > -1);
  });
  it('should not contain blabla', function () {
    assert(IntransitiveVerbs.indexOf('blabla') == -1);
  });
});
