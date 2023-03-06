/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');
const NlgLib = require('rosaenlg-lib').NlgLib;

const templateWord = `
p
  | #[+value('tomato', {number:'P'})]
`;

describe('rosaenlg', function () {
  describe('embed elements en_US', function () {
    describe('embed English words plural', function () {
      it(`check that word is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'en_US',
          compileDebug: false,
          words: ['criterion'], // => criteria
          embedResources: true,
        });

        assert(compiled.toString().indexOf(`"tomato":{"plural":"tomatoes"`) > -1);
        assert(compiled.toString().indexOf('criteria') > -1);
      });

      it(`check that word is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'en_US',
          compileDebug: false,
          embedResources: true,
        });

        // check the original rendering
        const originalCompiledFct = new Function('params', `${compiled}; return template(params);`);
        const originalRendered = originalCompiledFct({
          util: new NlgLib({ language: 'en_US' }),
        });
        //console.log(originalRendered);
        assert(originalRendered.indexOf('Tomatoes') > -1);
        // then hack it, otherwise impossible to distinguish with standard words lib
        const modifiedCompiled = compiled.replace('tomatoes', 'tomatoesx');
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);
        const modifiedRendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'en_US' }),
        });
        // console.log(modifiedRendered);
        assert(modifiedRendered.indexOf('Tomatoesx') > -1);
      });
    });
  });
});
