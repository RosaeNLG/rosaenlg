/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../dist/index.js');
const NlgLib = require('../../../dist/NlgLib').NlgLib;

const templateVerb = `
p
  | er #[+verb(getAnonMS(), {verb: 'essen', tense:'PRASENS'} )]
`;

const templateWord = `
- var PRODUKT = {};
mixin produkt_ref(obj, params)
  | #[+value('Gurke', {represents: PRODUKT})]
- PRODUKT.ref = produkt_ref;
p
  | #[+value(PRODUKT)] #{getRefGender(PRODUKT)}
`;

const templateAdj = `
p
  | #[+value('Gurke', {case:'GENITIVE', det:'DEFINITE', adj:'alt'})]
`;

const templateFindVerbs = `
p
  | #[+verb(subjP, 'machen')]
  | #[+verb(subjP, {verb: 'hören', tense:'PRATERITUM' } )]
  | #[+verb(subjP, {verb: 'blabla', tense:'PRATERITUM' } )]
  | #[+verb(subjS, {verb: 'aufräumen', tense:'PERFEKT', aux:'HABEN' } )] das Büro #[+verbPart]
  | #[+subjectVerb(subjS, {verb:'waschen', tense:'PRASENS', pronominal:true})]
`;

const templateEmpty = `
p
  | bla bla
`;

const templateFindWords = `
p
  | das #[+value('Handy', {represents: PRODUKT})]
  - setRefGender(PRODUKT, "Gurke");
`;

const templateFindAjectives = `
p
  | #[+value('Gurke', {case:'GENITIVE', det:'DEFINITE', adj:'neu'})]
  | #[+agreeAdj('alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'})]
  | #[+agreeAdj("schön", 'Gurke', {case:'GENITIVE', det:'DEFINITE'})]
`;

describe('rosaenlg', function () {
  describe('embed elements de_DE', function () {
    describe('embed German verbs', function () {
      it(`check that verb is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'de_DE',
          compileDebug: false,
          verbs: ['essen', 'fressen', 'gehen'],
          embedResources: true,
        });
        assert(compiled.toString().indexOf('essen') > -1);
        assert(compiled.toString().indexOf('fressen') > -1);
        assert(compiled.toString().indexOf('gehen') > -1);
        assert(!compiled.toString().indexOf('machen') > -1);
      });

      it(`check that verb is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'de_DE',
          compileDebug: false,
          verbs: ['essen'],
          embedResources: true,
        });
        // console.log(compiled);
        // "PRÄ":{"S":{"1":"esse","2":"isst","3":"isst"}

        // hack it, otherwise impossible to distinguish with standard verb lib
        const modifiedCompiled = compiled.replace(`"3":"isst"`, `"3":"isst la la"`);
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);

        const rendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'de_DE' }),
        });

        //console.log(rendered);

        assert(rendered.indexOf('isst la la') > -1);
      });

      describe(`find them automatically`, function () {
        const compiled = rosaenlgPug.compileClient(templateFindVerbs, {
          language: 'de_DE',
          compileDebug: false,
          embedResources: true,
        });
        ['machte', 'hörte', 'aufgeräumt', 'wusch'].forEach(function (toFind) {
          it(`${toFind} is embedded`, function () {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
        it(`other random verb is not embedded`, function () {
          assert(!compiled.toString().indexOf('sehe') > -1);
        });
      });
    });

    describe('embed German words gender', function () {
      it(`check that word is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'de_DE',
          compileDebug: false,
          words: ['Gurke'],
          embedResources: true,
        });

        //console.log(compiled);

        assert(compiled.toString().indexOf('"SIN":"Gurke"') > -1);
        assert(!compiled.toString().indexOf('Mann') > -1);
      });

      it(`check that word is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'de_DE',
          compileDebug: false,
          words: ['Gurke'],
          embedResources: true,
        });

        // check the original rendering
        const originalCompiledFct = new Function('params', `${compiled}; return template(params);`);
        const originalRendered = originalCompiledFct({
          util: new NlgLib({ language: 'de_DE' }),
        });
        // console.log(originalRendered);
        assert(originalRendered.indexOf('Gurke F') > -1);

        // then hack it, otherwise impossible to distinguish with standard words lib
        const modifiedCompiled = compiled.replace(`"G":"F"`, `"G":"N"`);
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);
        const modifiedRendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'de_DE' }),
        });
        //console.log(modifiedRendered);
        assert(modifiedRendered.indexOf('Gurke N') > -1);
      });

      describe(`find words automatically`, function () {
        const compiled = rosaenlgPug.compileClient(templateFindWords, {
          language: 'de_DE',
          compileDebug: false,
          embedResources: true,
        });

        //console.log(compiled);

        ['"G":"N"', '"G":"F"'].forEach(function (toFind) {
          it(`${toFind} is embedded`, function () {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
        it(`other random word is not embedded`, function () {
          assert(compiled.toString().indexOf('Telefon') === -1);
        });
      });
    });
  });

  describe('embed German adjectives', function () {
    it(`check that adj is properly embedded in the template`, function () {
      const compiled = rosaenlgPug.compileClient(templateAdj, {
        language: 'de_DE',
        compileDebug: false,
        adjectives: ['alt', 'dick'],
        embedResources: true,
      });

      //console.log(compiled);

      assert(compiled.toString().indexOf('alten') > -1);
      assert(compiled.toString().indexOf('dicken') > -1);
      assert(!compiled.toString().indexOf('klein') > -1);
    });

    it(`check that adj is properly loaded at runtime`, function () {
      const compiled = rosaenlgPug.compileClient(templateAdj, {
        language: 'de_DE',
        compileDebug: false,
        adjectives: ['alt'],
        embedResources: true,
      });

      // check the original rendering
      const originalCompiledFct = new Function('params', `${compiled}; return template(params);`);
      const originalRendered = originalCompiledFct({
        util: new NlgLib({ language: 'de_DE' }),
      });
      //console.log(originalRendered);
      assert(originalRendered.indexOf('Der alten Gurke') > -1);

      // then hack it, otherwise impossible to distinguish with standard words lib
      const modifiedCompiled = compiled.replace(/:"alten"/g, `:"sehr alten"`);
      const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);
      const modifiedRendered = modifiedCompiledFct({
        util: new NlgLib({ language: 'de_DE' }),
      });
      //console.log(modifiedRendered);
      assert(modifiedRendered.indexOf('Der sehr alten Gurke') > -1);
    });

    describe(`find adjectives automatically`, function () {
      const compiled = rosaenlgPug.compileClient(templateFindAjectives, {
        language: 'de_DE',
        compileDebug: false,
        embedResources: true,
      });

      ['neuem', 'schönen', 'altem'].forEach(function (toFind) {
        it(`${toFind} is embedded`, function () {
          assert(compiled.toString().indexOf(toFind) > -1);
        });
      });
      it(`other random adjective is not embedded`, function () {
        assert(compiled.toString().indexOf('gut') === -1);
      });
    });
  });
});
