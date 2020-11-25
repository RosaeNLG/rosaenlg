/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const IntransitiveVerbs = require('../dist/intransitive.json');

describe('french-verbs-intransitive', function () {
  it('should contain some stuff', function () {
    assert(IntransitiveVerbs.length > 50);
    assert(IntransitiveVerbs.indexOf('apparaître') > -1);
    assert(IntransitiveVerbs.indexOf('blabla') == -1);
  });
});
