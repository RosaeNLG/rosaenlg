/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../../../rosaenlg/dist/index.js');
const NlgLib = require('rosaenlg-lib').NlgLib;

const templateVerb = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
`;

const templateWord = `
- var PRODUIT = {};
mixin produit_ref(obj, params)
  | la #[+value('bague', {represents: PRODUIT})]
- PRODUIT.ref = produit_ref;
p
  | #[+value(PRODUIT)] #{getRefGender(PRODUIT)}
p
  | #[+value('plage', {det:'DEFINITE', number:'P'})]
`;

const templateFindVerbs = `
p
  | #[+subjectVerb(getAnonMS(), {verb:'aller'}, {'bla':'bla'})]
  | #[+subjectVerb(getAnonMS(), {verb: "voir"}, {'bla':'bla'})]
  | #[+subjectVerbAdj(getAnonMS(), 'être', 'habile')]
  | #[+subjectVerbAdj(getAnonMS(), "travailler", 'habile')]
  | #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
  | #[+verb(getAnonMS(), {'verb' : 'danser', tense:'FUTUR'} )]
  | #[+verb(getAnonMS(), 'finir' )]
  | #[+verb(getAnonMS(), getVerbBla() )]
  | #[+verb(getAnonMS(), {verb:getVerbBla()} )]
`;

const templateVerbPasseCompose = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'PASSE_COMPOSE'} )]
`;

const templateFindWords = `
p
  | #[+value('bague', {represents: PRODUIT})]
  | #[+value( "anneau", {represents: getMachin()})]
  - setRefGender(PRODUIT2, 'collier');
  - setRefGender(getMachin(), "perle");
  | #[+thirdPossession(TOUS_PRODUITS,'pureté')]
  | #[+value("caillou", {number:PRODUIT2})]
`;

const templateDate = `
p
  - var d = new Date(1980, 3, 14);
  | le #[+value(d, {dateFormat:"EEEE d MMMM Y"})]
`;

const templateAdj = `
p
  | #[+value('homme', {det:'INDEFINITE', adj:'vieux', adjPos:'BEFORE'})]
`;

describe('rosaenlg', function () {
  describe('embed elements fr_FR', function () {
    describe('embed French verbs', function () {
      it(`check that verb is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['chanter', 'finir'],
          embedResources: true,
        });
        assert(compiled.toString().indexOf('finira') > -1);
        assert(compiled.toString().indexOf('chantera') > -1);
        assert(!compiled.toString().indexOf('ira') > -1);
      });

      it(`check that verb is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['chanter', 'finir'],
          embedResources: true,
        });

        // hack it, otherwise impossible to distinguish with standard verb lib
        const modifiedCompiled = compiled.replace(`"chantera"`, `"chantera la la"`);
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);

        const rendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });

        //console.log(rendered);

        assert(rendered.indexOf('chantera la la') > -1);
      });

      describe(`find them automatically`, function () {
        const compiled = rosaenlgPug.compileClient(templateFindVerbs, {
          language: 'fr_FR',
          compileDebug: false,
          embedResources: true,
        });
        // aller être chanter finir
        ['ira', 'sera', 'chantera', 'finira', 'dansera', 'travaillera', 'verra'].forEach(function (toFind) {
          it(`${toFind} is embedded`, function () {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
        it(`other random verb is not embedded`, function () {
          assert(!compiled.toString().indexOf('lavera') > -1);
        });
      });

      describe(`find them automatically, no duplicates`, function () {
        const compiled = rosaenlgPug.compileClient(templateFindVerbs, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['chanter'],
          embedResources: true,
        });
        it(`chantera embedded only once`, function () {
          const regex = /chantâtes/gi;
          let result;
          const indices = [];
          while ((result = regex.exec(compiled))) {
            indices.push(result.index);
          }
          assert(indices.length === 1);
        });
      });

      describe(`merge lists`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['manger'],
          embedResources: true,
        });
        ['mangera', 'chantera'].forEach(function (toFind) {
          it(`${toFind} is embedded`, function () {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
      });

      describe(`do not embed`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['manger'],
          embedResources: false,
        });
        ['mangera', 'chantera'].forEach(function (toFind) {
          it(`${toFind} is not embedded`, function () {
            assert(compiled.toString().indexOf(toFind) === -1);
          });
        });
      });

      describe(`check aux avoir être`, function () {
        const compiled = rosaenlgPug.compileClient(templateVerbPasseCompose, {
          language: 'fr_FR',
          compileDebug: false,
          embedResources: true,
        });

        const compiledFct = new Function('params', `${compiled}; return template(params);`);
        const rendered = compiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        it(`a chanté is ok`, function () {
          assert(rendered.indexOf('a chanté') > -1);
        });
      });
    });

    describe('embed French words gender and plural', function () {
      it(`check that word is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'fr_FR',
          compileDebug: false,
          words: ['caillou'],
          embedResources: true,
        });

        assert(compiled.toString().indexOf('{"bague":{"gender":"F"') > -1);
        assert(compiled.toString().indexOf('"plural":"cailloux"') > -1);
        assert(!compiled.toString().indexOf('bijou') > -1);
      });

      it(`check that word is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateWord, {
          language: 'fr_FR',
          compileDebug: false,
          // words: ['bague'],
          embedResources: true,
        });

        // check the original rendering
        const originalCompiledFct = new Function('params', `${compiled}; return template(params);`);
        const originalRendered = originalCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        // console.log(originalRendered);
        assert(originalRendered.indexOf('bague F') > -1);
        assert(originalRendered.indexOf('plages') > -1);
        // then hack it, otherwise impossible to distinguish with standard words lib
        const modifiedCompiled = compiled
          .replace(`"bague":{"gender":"F"`, `"bague":{"gender":"M"`)
          .replace('plages', 'plagex');
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);
        const modifiedRendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        // console.log(modifiedRendered);
        assert(modifiedRendered.indexOf('bague M') > -1);
        assert(modifiedRendered.indexOf('plagex') > -1);
      });

      describe(`find words automatically`, function () {
        const compiled = rosaenlgPug.compileClient(templateFindWords, {
          language: 'fr_FR',
          compileDebug: false,
          embedResources: true,
        });

        //console.log(compiled);

        [
          '"bague":{"gender":"F"',
          '"anneau":{"gender":"M"',
          '"collier":{"gender":"M"',
          '"perle":{"gender":"F"',
          '"pureté":{"gender":"F"',
          '"cailloux"',
        ].forEach(function (toFind) {
          it(`${toFind} is embedded`, function () {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
        it(`other random word is not embedded`, function () {
          assert(compiled.toString().indexOf('machine') === -1);
        });
      });
    });

    describe('embed French adjectives', function () {
      it(`check that adj is properly embedded in the template`, function () {
        const compiled = rosaenlgPug.compileClient(templateAdj, {
          language: 'fr_FR',
          compileDebug: false,
          adjectives: ['beau'],
          embedResources: true,
        });
        assert(compiled.toString().indexOf('"beau":{"MS":"beau"') > -1);
        assert(compiled.toString().indexOf('"vieux":"vieil"') > -1);
      });

      it(`check that adj is properly loaded at runtime`, function () {
        const compiled = rosaenlgPug.compileClient(templateAdj, {
          language: 'fr_FR',
          compileDebug: false,
          embedResources: true,
        });

        // check the original rendering
        const originalCompiledFct = new Function('params', `${compiled}; return template(params);`);
        const originalRendered = originalCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        // console.log(originalRendered);
        assert(originalRendered.indexOf('Un vieil homme') > -1);

        // then hack it, otherwise impossible to distinguish with standard words lib
        const modifiedCompiled = compiled.replace(`vieil`, `vieilx`);
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);
        const modifiedRendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        // console.log(modifiedRendered);
        assert(modifiedRendered.indexOf('Un vieilx homme') > -1);
      });
    });
  });

  describe('render fr_FR', function () {
    it(`check date`, function () {
      const compiled = rosaenlgPug.compileClient(templateDate, {
        language: 'fr_FR',
        compileDebug: false,
        embedResources: true,
      });

      const compiledFct = new Function('params', `${compiled}; return template(params);`);
      const rendered = compiledFct({
        util: new NlgLib({ language: 'fr_FR' }),
      });
      assert(rendered.indexOf('Le lundi 14 avril 1980') > -1);
    });
  });
});
