/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlg = require('../../../rosaenlg/dist/index.js');

const templateEmptySyn = `
| start
synz
  syn
    | syn11
  syn
    | syn12
| middle
synz
  syn
    | syn21
  syn
    | syn22
  syn
    |
| end
`;

const templateAllEmpty = `
| start
synz
  syn
    |
  syn
    if false
      | should not trigger
| end
`;

const templatePathToFind = `
| start
synz
  syn
    |
  syn
    if false
      | should not trigger
  syn
    synz
      syn
        |
      syn
        if false
          | should not trigger
      syn
        | ok        
| end
`;

describe('rosaenlg', function () {
  it('no empty synonym', function () {
    for (let j = 0; j < 20; j++) {
      const params = {
        language: 'en_US',
      };
      const rendered = rosaenlg.render(templateEmptySyn, params);

      assert(rendered.indexOf('syn21') > -1 || rendered.indexOf('syn22') > -1, rendered);
    }
  });
  it('only empty alternatives', function () {
    const params = {
      language: 'en_US',
    };
    const rendered = rosaenlg.render(templateAllEmpty, params);

    assert.strictEqual(rendered, 'Start end');
  });
  it('only 1 good path', function () {
    const params = {
      language: 'en_US',
    };
    const rendered = rosaenlg.render(templatePathToFind, params);

    assert.strictEqual(rendered, 'Start ok end');
  });
});
