var assert = require('assert');
const freenlgPug = require('../../../dist/index.js');
const NlgLib = require('../../../dist/NlgLib').NlgLib;

const templateVerb = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
`;

const templateWord = `
- var PRODUIT = {};
- PRODUIT.ref = 'produit_ref';
mixin produit_ref(obj, params)
  | la #[+value('bague', {represents: PRODUIT})]
p
  | #[+value(PRODUIT)] #{getRefGender(PRODUIT)}
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
`;

const templateDate = `
p
  - var d = new Date('1980-04-14');
  | le #[+value(d, {dateFormat:"dddd Do MMMM YYYY"})]
`;

describe('freenlg', function() {
  describe('embed elements fr_FR', function() {
    describe('embed French verbs', function() {
      it(`check that verb is properly embedded in the template`, function() {
        const compiled = freenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['chanter', 'finir'],
          embedResources: true,
        });
        assert(compiled.toString().indexOf('finira') > -1);
        assert(compiled.toString().indexOf('chantera') > -1);
        assert(!compiled.toString().indexOf('ira') > -1);
      });

      it(`check that verb is properly loaded at runtime`, function() {
        const compiled = freenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['chanter', 'finir'],
          embedResources: true,
        });

        // hack it, otherwise impossible to distinguish with standard verb lib
        const modifiedCompiled = compiled.replace(`"chantera"`, `"chantera la la"`);
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);

        let rendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });

        //console.log(rendered);

        assert(rendered.indexOf('chantera la la') > -1);
      });

      describe(`find them automatically`, function() {
        const compiled = freenlgPug.compileClient(templateFindVerbs, {
          language: 'fr_FR',
          compileDebug: false,
          embedResources: true,
        });
        // aller être chanter finir
        ['ira', 'sera', 'chantera', 'finira', 'dansera', 'travaillera', 'verra'].forEach(function(toFind) {
          it(`${toFind} is embedded`, function() {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
        it(`other random verb is not embedded`, function() {
          assert(!compiled.toString().indexOf('lavera') > -1);
        });
      });

      describe(`find them automatically, no duplicates`, function() {
        const compiled = freenlgPug.compileClient(templateFindVerbs, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['chanter'],
          embedResources: true,
        });
        it(`chantera embedded only once`, function() {
          var regex = /chantâtes/gi,
            result,
            indices = [];
          while ((result = regex.exec(compiled))) {
            indices.push(result.index);
          }
          assert(indices.length == 1);
        });
      });

      describe(`merge lists`, function() {
        const compiled = freenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['manger'],
          embedResources: true,
        });
        ['mangera', 'chantera'].forEach(function(toFind) {
          it(`${toFind} is embedded`, function() {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
      });

      describe(`do not embed`, function() {
        const compiled = freenlgPug.compileClient(templateVerb, {
          language: 'fr_FR',
          compileDebug: false,
          verbs: ['manger'],
          embedResources: false,
        });
        ['mangera', 'chantera'].forEach(function(toFind) {
          it(`${toFind} is not embedded`, function() {
            assert(compiled.toString().indexOf(toFind) == -1);
          });
        });
      });

      describe(`check aux avoir être`, function() {
        const compiled = freenlgPug.compileClient(templateVerbPasseCompose, {
          language: 'fr_FR',
          compileDebug: false,
          embedResources: true,
        });

        const compiledFct = new Function('params', `${compiled}; return template(params);`);
        let rendered = compiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        it(`a chanté is ok`, function() {
          assert(rendered.indexOf('a chanté') > -1);
        });
      });
    });

    describe('embed French words gender', function() {
      it(`check that word is properly embedded in the template`, function() {
        const compiled = freenlgPug.compileClient(templateWord, {
          language: 'fr_FR',
          compileDebug: false,
          words: ['bague'],
          embedResources: true,
        });

        assert(compiled.toString().indexOf('{"bague":"F"}') > -1);
        assert(!compiled.toString().indexOf('bijou') > -1);
      });

      it(`check that word is properly loaded at runtime`, function() {
        const compiled = freenlgPug.compileClient(templateWord, {
          language: 'fr_FR',
          compileDebug: false,
          words: ['bague'],
          embedResources: true,
        });

        // check the original rendering
        const originalCompiledFct = new Function('params', `${compiled}; return template(params);`);
        let originalRendered = originalCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        // console.log(originalRendered);
        assert(originalRendered.indexOf('bague F') > -1);

        // then hack it, otherwise impossible to distinguish with standard words lib
        const modifiedCompiled = compiled.replace(`{"bague":"F"}`, `{"bague":"M"}`);
        const modifiedCompiledFct = new Function('params', `${modifiedCompiled}; return template(params);`);
        let modifiedRendered = modifiedCompiledFct({
          util: new NlgLib({ language: 'fr_FR' }),
        });
        //console.log(modifiedRendered);
        assert(modifiedRendered.indexOf('bague M') > -1);
      });

      describe(`find words automatically`, function() {
        const compiled = freenlgPug.compileClient(templateFindWords, {
          language: 'fr_FR',
          compileDebug: false,
          embedResources: true,
        });

        //console.log(compiled);

        ['"bague":"F"', '"anneau":"M"', '"collier":"M"', '"perle":"F"', '"pureté":"F"'].forEach(function(toFind) {
          it(`${toFind} is embedded`, function() {
            assert(compiled.toString().indexOf(toFind) > -1);
          });
        });
        it(`other random word is not embedded`, function() {
          assert(compiled.toString().indexOf('machine') == -1);
        });
      });
    });
  });

  describe('render fr_FR', function() {
    it(`check date`, function() {
      const compiled = freenlgPug.compileClient(templateDate, {
        language: 'fr_FR',
        compileDebug: false,
        embedResources: true,
      });

      const compiledFct = new Function('params', `${compiled}; return template(params);`);
      let rendered = compiledFct({
        util: new NlgLib({ language: 'fr_FR' }),
      });
      assert(rendered.indexOf('Le lundi 14 avril 1980') > -1);
    });
  });
});
