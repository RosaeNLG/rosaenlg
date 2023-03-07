/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../rosaenlg/dist/index.js');

const template = `
p
  a(href='https://www.google.com/') Google
  | bla.bla
`;

describe('rosaenlg', function () {
  describe('renderFileParams', function () {
    it('test sophisticated anchor', function () {
      const rendered = rosaenlgPug.render(template, {
        language: 'en_US',
      });
      assert.strictEqual(rendered, '<p><a href="https://www.google.com/">Google</a> bla. Bla</p>');
    });

    it('no language', function () {
      assert.throws(() => {
        rosaenlgPug.render(`p`, {});
      }, /language/);
    });
  });
});
