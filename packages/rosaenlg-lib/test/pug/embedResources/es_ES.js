/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../../rosaenlg/dist/index.js');
const NlgLib = require('rosaenlg-lib').NlgLib;

const templateVerb = `
| #[+verb(getAnonMS(), {verb:'ser', tense:'SUBJUNCTIVE_PLUPERFECT'})]
`;

const templateWord = `
| #[+value('luz', {det:'INDEFINITE', number:'P'})]
`;

const templateFindWords = `
| #[+value('anillo', {represents: BLA})]
| #[+value( "alianza", {represents: getSomething()})]
- setRefGender(PRODUCTO2, 'collar');
| #[+value("piedra", {number:PRODUCTO2})]
`;

describe('rosaenlg', function () {
  describe('embed elements es_ES', function () {
    describe('embed verbs', function () {
      it(`check that verb is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'es_ES',
          compileDebug: false,
          verbs: ['hablar'],
          embedResources: true,
        });
        assert(compiled.toString().indexOf('hubiera sido') > -1); // ser
        assert(compiled.toString().indexOf('habla') > -1);
      });

      it(`check that verb is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'es_ES',
          compileDebug: false,
          verbs: ['hablar'],
          embedResources: true,
        });

        // hack it, otherwise impossible to distinguish with standard verb lib
        const modifiedCompiled = compiled.replace(/"hubiera sido"/g, '"hubiera sido zzz"');
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);

        const rendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'es_ES' }),
        });

        //console.log(rendered);

        assert(rendered.indexOf('Hubiera sido zzz') > -1);
      });
    });

    describe('embed words gender and plural', function () {
      it(`check that word is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'es_ES',
          compileDebug: false,
          words: ['piedra'],
          embedResources: true,
        });

        assert(compiled.toString().indexOf('{"luz":{"gender":"F"') > -1);
        assert(compiled.toString().indexOf('"plural":"piedras"') > -1);
        assert(compiled.toString().indexOf('"plural":"luces"') > -1);
      });

      it(`check that word is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'es_ES',
          compileDebug: false,
          embedResources: true,
        });

        // check the original rendering
        const originalCompiledFct = new Function('params', `${compiled}; return template(params);`);
        const originalRendered = originalCompiledFct({
          util: new NlgLib({ language: 'es_ES' }),
        });
        // console.log(originalRendered);
        assert(originalRendered.indexOf('Unas luces') > -1);
        // then hack it, otherwise impossible to distinguish with standard words lib
        const modifiedCompiled = compiled.replace('luces', 'lucesx');
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);
        const modifiedRendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'es_ES' }),
        });
        // console.log(modifiedRendered);
        assert(modifiedRendered.indexOf('Unas lucesx') > -1);
      });

      describe(`find words automatically`, function () {
        const compiled = rosaenlgPug.compileClient(templateFindWords, {
          language: 'es_ES',
          compileDebug: false,
          embedResources: true,
        });

        //console.log(compiled);

        [
          '"anillo":{"gender":"M"',
          '"alianza":{"gender":"F"',
          '"collar":{"gender":"M"',
          '"piedra":{"gender":"F"',
          '"anillos"',
        ].forEach(function (toFind) {
          it(`${toFind} is embedded`, function () {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
      });
    });
  });
});
