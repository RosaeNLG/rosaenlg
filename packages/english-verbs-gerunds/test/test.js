/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const EnglishGerunds = require('../dist/gerunds.json');

const testCasesIng = [
  ['get', 'getting'],
  ['let', 'letting'],
  ['plan', 'planning'],
  ['die', 'dying'],
  ['lie', 'lying'],
  ['ban', 'banning'],
  ['fit', 'fitting'],
  ['begin', 'beginning'],
  ['stop', 'stopping'],
  ['plan', 'planning'],
  ['swim', 'swimming'],
  ['travel', 'travelling'],
  ['refer', 'referring'],
  ['defer', 'deferring'],
];

describe('english-verbs-gerunds', function () {
  for (let i = 0; i < testCasesIng.length; i++) {
    const testCase = testCasesIng[i];
    const verb = testCase[0];
    const expected = testCase[1];
    it(`${verb} => ${expected}`, function () {
      assert.strictEqual(EnglishGerunds[verb], expected);
    });
  }
});
