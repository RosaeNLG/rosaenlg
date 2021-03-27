/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const EnglishVerbs = require('../dist/index.js');
const EnglishVerbsIrregular = require('english-verbs-irregular');
const EnglishGerunds = require('english-verbs-gerunds');

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
    // new ones
    ['marry', 'S', 'married'],
    ['cry', 'S', 'cried'],
    ['enjoy', 'S', 'enjoyed'],
    ['disagree', 'S', 'disagreed'],
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
    ['be', 'S', 'is being'],
  ],
  PROGRESSIVE_FUTURE: [
    ['sleep', 'S', 'will be sleeping'],
    ['save', 'P', 'will be saving'],
  ],

  // PERFECT
  PERFECT_PAST: [
    ['go', 'S', 'had gone'],
    ['eat', 'P', 'had eaten'],
  ],
  PERFECT_PRESENT: [
    ['drive', 'S', 'has driven'],
    ['see', 'P', 'have seen'],
    ['be', 'P', 'have been'],
    ['refuse', 'S', 'has refused'],
    ['create', 'S', 'has created'],
    ['dye', 'S', 'has dyed'],
    ['hoe', 'S', 'has hoed'],
    ['singe', 'S', 'has singed'],
    ['die', 'S', 'has died'],
    ['disagree', 'S', 'has disagreed'],
  ],
  PERFECT_FUTURE: [
    ['watch', 'S', 'will have watched'],
    ['catch', 'P', 'will have caught'],
  ],
  PERFECT_PROGRESSIVE_PAST: [
    ['grow', 'S', 'had been growing'],
    ['let', 'P', 'had been letting'],
  ],
  PERFECT_PROGRESSIVE_PRESENT: [
    ['read', 'S', 'has been reading'],
    ['light', 'P', 'have been lighting'],
  ],
  PERFECT_PROGRESSIVE_FUTURE: [
    ['check', 'S', 'will have been checking'],
    ['bite', 'P', 'will have been biting'],
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
  ['create', 'creating'],
  ['type', 'typing'],
  ['shake', 'shaking'],
  ['dye', 'dyeing'],
  ['hoe', 'hoeing'],
  ['singe', 'singeing'],
  ['disagree', 'disagreeing'],
];

describe('english-verb-helpers', function () {
  const resourceGerundsOnly = EnglishVerbs.mergeVerbsData(null, EnglishGerunds);
  const resourceIrregularOnly = EnglishVerbs.mergeVerbsData(EnglishVerbsIrregular, null);

  describe('#getConjugation()', function () {
    describe('nominal cases', function () {
      const tenses = Object.keys(testCases);
      for (let i = 0; i < tenses.length; i++) {
        const tense = tenses[i];
        describe(tense, function () {
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

            let resourceToUse;
            if (['PAST', 'SIMPLE_PAST', 'PERFECT_PAST', 'PERFECT_PRESENT', 'PERFECT_FUTURE'].indexOf(tense) > -1) {
              resourceToUse = resourceIrregularOnly;
            }
            if (
              [
                'PROGRESSIVE_PAST',
                'PROGRESSIVE_PRESENT',
                'PROGRESSIVE_FUTURE',
                'PERFECT_PROGRESSIVE_PAST',
                'PERFECT_PROGRESSIVE_PRESENT',
                'PERFECT_PROGRESSIVE_FUTURE',
              ].indexOf(tense) > -1
            ) {
              resourceToUse = resourceGerundsOnly;
            }

            it(`${verb} ${tense} ${number} ${
              extraParams ? JSON.stringify(extraParams) : ''
            } => ${expected}`, function () {
              assert.strictEqual(
                EnglishVerbs.getConjugation(resourceToUse, verb, tense, number, extraParams),
                expected,
              );
            });
          }
        });
      }
    });
    describe('ing form', function () {
      for (let i = 0; i < testCasesIng.length; i++) {
        const testCase = testCasesIng[i];
        const verb = testCase[0];
        const expected = testCase[1];
        it(`${verb} => ${expected}`, function () {
          assert.strictEqual(EnglishVerbs.getIngPart(resourceGerundsOnly[verb], verb), expected);
        });
      }
    });
    describe('edge cases', function () {
      it(`null verb`, function () {
        assert.throws(() => EnglishVerbs.getConjugation(null, null, 'PRESENT', 'S'), /verb/);
      });
      it(`invalid number`, function () {
        assert.throws(() => EnglishVerbs.getConjugation(null, 'eat', 'PRESENT', 'X'), /number/);
      });
      it(`invalid tense`, function () {
        assert.throws(() => EnglishVerbs.getConjugation(null, 'eat', 'PLUS_QUE_BLABLA', 'S'), /tense/);
      });
      it(`no verbs info`, function () {
        assert.strictEqual(EnglishVerbs.getConjugation(null, 'go', 'PERFECT_FUTURE', 'S'), 'will have goed');
      });
      it(`resource combination`, function () {
        const resourceBoth = EnglishVerbs.mergeVerbsData(EnglishVerbsIrregular, EnglishGerunds);
        assert.strictEqual(
          EnglishVerbs.getConjugation(resourceBoth, 'swim', 'PROGRESSIVE_PRESENT', 'S'),
          'is swimming',
        );
        assert.strictEqual(EnglishVerbs.getConjugation(resourceBoth, 'swim', 'SIMPLE_PAST', 'S'), 'swam');
        assert.strictEqual(EnglishVerbs.getConjugation(resourceBoth, 'swim', 'PERFECT_PRESENT', 'S'), 'has swum');
      });
    });
  });
});
