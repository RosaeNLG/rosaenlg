const assert = require('assert');
const EnglishVerbs = require('../dist/index.js');
const EnglishVerbsIrregular = require('english-verbs-irregular');

const testCases = {
  // SIMPLE
  PRESENT: [
    ['eat', 'S', 'eats'],
    ['eat', 'P', 'eat'],
    ['listen', 'S', 'listens'],
    // irregular
    ['fly', 'S', 'flies'],
    ['play', 'S', 'plays'],
    ['go', 'S', 'goes'],
    ['do', 'S', 'does'],
    ['have', 'S', 'has'],
    ['be', 'S', 'is'],
    ['be', 'P', 'are'],
    ['pass', 'S', 'passes'],
    ['catch', 'S', 'catches'],
    ['fix', 'S', 'fixes'],
    ['push', 'S', 'pushes'],
    ['can', 'S', 'can'],
  ],
  SIMPLE_PRESENT: [['snow', 'S', 'snows']],
  PAST: [
    // regular
    ['listen', 'S', 'listened'],
    ['listen', 'P', 'listened'],
    // irregular
    ['come', 'S', 'came'],
    ['come', 'P', 'came'],
    ['go', 'S', 'went'],
    ['wake', 'S', 'woke'],
    // be have do
    ['be', 'S', 'was'],
    ['be', 'P', 'were'],
    ['have', 'S', 'had'],
    ['have', 'P', 'had'],
    ['do', 'S', 'did'],
    ['do', 'P', 'did'],
  ],
  SIMPLE_PAST: [['see', 'P', 'saw']],
  SIMPLE_FUTURE: [
    ['sleep', 'S', 'will sleep'],
    ['sleep', 'P', 'will sleep'],
    ['sleep', 'S', 'is going to sleep', { GOING_TO: true }],
    ['sleep', 'P', 'are going to sleep', { GOING_TO: true }],
    ['sleep', 'S', 'will sleep', { WILL: true }],
  ],
  FUTURE: [['rest', 'S', 'will rest']],

  // PROGRESSIVE
  PROGRESSIVE_PAST: [
    ['wonder', 'S', 'was wondering'],
    ['get', 'P', 'were getting'],
  ],
  PROGRESSIVE_PRESENT: [
    ['get', 'S', 'is getting'],
    ['frap', 'P', 'are frapping'],
  ],
  PROGRESSIVE_FUTURE: [
    ['sleep', 'S', 'will be sleeping'],
    ['save', 'P', 'will be saving'],
  ],
};

const testCasesIng = [
  ['find', 'finding'],
  ['laugh', 'laughing'],
  ['wash', 'washing'],
  ['arise', 'arising'],
  ['become', 'becoming'],
  ['have', 'having'],
  ['get', 'getting'],
  ['let', 'letting'],
  ['plan', 'planning'],
  ['die', 'dying'],
  ['lie', 'lying'],
  ['dare', 'daring'],
  ['ban', 'banning'],
  ['fit', 'fitting'],
  ['shoe', 'shoeing'],
  ['pay', 'paying'],
  ['wonder', 'wondering'],
  ['begin', 'beginning'],
  ['stop', 'stopping'],
  ['plan', 'planning'],
  ['swim', 'swimming'],
  ['happen', 'happening'],
  ['suffer', 'suffering'],
  ['enter', 'entering'],
  ['fix', 'fixing'],
  ['enjoy', 'enjoying'],
  ['snow', 'snowing'],
  ['travel', 'travelling'],
  ['refer', 'referring'],
  ['defer', 'deferring'],
  ['whisper', 'whispering'],
];

describe('english-verbs', function() {
  describe('#getConjugation()', function() {
    describe('nominal cases', function() {
      const tenses = Object.keys(testCases);
      for (let i = 0; i < tenses.length; i++) {
        const tense = tenses[i];
        describe(tense, function() {
          for (let j = 0; j < testCases[tense].length; j++) {
            const testCase = testCases[tense][j];
            const verb = testCase[0];
            const number = testCase[1];
            const expected = testCase[2];

            let extraParams;
            if (tense === 'FUTURE' || tense === 'SIMPLE_FUTURE') {
              // has extra params sometimes
              if (testCase.length > 3) {
                extraParams = testCase[3];
              }
            }

            let verbsList;
            if (tense === 'PAST' || tense === 'SIMPLE_PAST') {
              verbsList = EnglishVerbsIrregular;
            }

            it(`${verb} ${tense} ${number} ${
              extraParams ? JSON.stringify(extraParams) : ''
            } => ${expected}`, function() {
              assert.equal(EnglishVerbs.getConjugation(verbsList, verb, tense, number, extraParams), expected);
            });
          }
        });
      }
    });
    describe('ing form', function() {
      for (let i = 0; i < testCasesIng.length; i++) {
        const testCase = testCasesIng[i];
        const verb = testCase[0];
        const expected = testCase[1];
        it(`${verb} => ${expected}`, function() {
          assert.equal(EnglishVerbs.getIng(verb), expected);
        });
      }
    });
    describe('edge cases', function() {
      it(`null verb`, function() {
        assert.throws(() => EnglishVerbs.getConjugation(null, null, 'PRESENT', 'S'), /verb/);
      });
      it(`invalid number`, function() {
        assert.throws(() => EnglishVerbs.getConjugation(null, 'eat', 'PRESENT', 'X'), /number/);
      });
      it(`invalid tense`, function() {
        assert.throws(() => EnglishVerbs.getConjugation(null, 'eat', 'PLUS_QUE_BLABLA', 'S'), /tense/);
      });
    });
  });
});
