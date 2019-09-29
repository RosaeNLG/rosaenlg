const assert = require('assert');
const GermanAdjectives = require('../dist/index.js');

const testCases = [
  ['alt', 'NOMINATIVE', 'M', 'S', 'DEFINITE', 'alte'],
  ['alt', 'DATIVE', 'N', 'S', 'DEFINITE', 'alten'],
  ['alt', 'GENITIVE', 'F', 'S', 'DEFINITE', 'alten'],
  ['alt', 'GENITIVE', 'F', 'S', 'DEMONSTRATIVE', 'alten'],
  ['alt', 'GENITIVE', 'F', 'P', 'DEMONSTRATIVE', 'alten'],

  ['alt', 'ACCUSATIVE', 'F', 'S', 'INDEFINITE', 'alte'],
  ['alt', 'NOMINATIVE', 'F', 'S', 'INDEFINITE', 'alte'],
  ['alt', 'ACCUSATIVE', 'N', 'S', 'INDEFINITE', 'altes'],
  ['alt', 'NOMINATIVE', 'M', 'P', 'INDEFINITE', 'alte'],
  ['alt', 'NOMINATIVE', 'F', 'P', 'INDEFINITE', 'alte'],

  // adjectif verbal
  ['zitternd', 'NOMINATIVE', 'M', 'S', 'INDEFINITE', 'zitternder'],
  ['zitternd', 'NOMINATIVE', 'M', 'P', 'INDEFINITE', 'zitternde'],
  ['überraschend', 'ACCUSATIVE', 'N', 'S', 'INDEFINITE', 'überraschendes'],
  ['überraschend', 'NOMINATIVE', 'N', 'S', 'DEFINITE', 'überraschende'],
  // past participle
  ['enttäuscht', 'NOMINATIVE', 'F', 'S', 'DEFINITE', 'enttäuschte'],
];

describe('german-adjectives', function() {
  describe('#agreeGermanAdjective()', function() {
    describe('nominal', function() {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        it(`${JSON.stringify(testCase.slice(0, 5))} => ${testCase[5]}`, function() {
          assert.equal(
            GermanAdjectives.agreeGermanAdjective(testCase[0], testCase[1], testCase[2], testCase[3], testCase[4]),
            testCase[5],
          );
        });
      }
    });

    describe('local adj list', function() {
      const dickInfo = JSON.parse(JSON.stringify(GermanAdjectives.getAdjectiveInfo('dick')));
      // console.log(dickInfo);
      dickInfo['NOM']['DEF']['M'] = 'dick und stark';

      it(`overrides adj list`, function() {
        assert.equal(
          GermanAdjectives.agreeGermanAdjective('dick', 'NOMINATIVE', 'M', 'S', 'DEFINITE', { dick: dickInfo }),
          'dick und stark',
        );
      });
    });

    describe('edge', function() {
      it(`invalid case`, function() {
        assert.throws(
          () => GermanAdjectives.agreeGermanAdjective('alt', 'ADMINISTRATIVE', 'F', 'S', 'DEMONSTRATIVE'),
          /case/,
        );
      });
      it(`adjective not in dict`, function() {
        assert.throws(
          () => GermanAdjectives.agreeGermanAdjective('blabla', 'GENITIVE', 'F', 'S', 'DEMONSTRATIVE'),
          /dict/,
        );
      });
      it(`invalid determiner`, function() {
        assert.throws(
          () => GermanAdjectives.agreeGermanAdjective('alt', 'GENITIVE', 'F', 'S', 'GESTICULATIVE'),
          /determin/,
        );
      });
      it(`invalid gender`, function() {
        assert.throws(() => GermanAdjectives.agreeGermanAdjective('alt', 'NOMINATIVE', 'X', 'S', 'DEFINITE'), /gender/);
      });
      it(`invalid number`, function() {
        assert.throws(() => GermanAdjectives.agreeGermanAdjective('alt', 'NOMINATIVE', 'F', 'X', 'DEFINITE'), /number/);
      });
    });
  });
});
