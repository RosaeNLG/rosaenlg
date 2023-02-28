/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const EnglishVerbs = require('../dist/index.js');
const EnglishVerbsIrregular = require('english-verbs-irregular/dist/verbs.json');
const EnglishGerunds = require('english-verbs-gerunds/dist/gerunds.json');

const testCases = {
  // SIMPLE
  PRESENT: [
    ['eat', 'S', 'eats'],
    ['eat', 'S', 'does not eat', { NEGATIVE: true }],
    ['eat', 'S', "doesn't eat", { NEGATIVE: true, CONTRACT: true }],
    ['eat', 'P', 'eat'],
    ['listen', 'S', 'listens'],
    // irregular
    ['fly', 'S', 'flies'],
    ['fly', 'S', 'does not fly', { NEGATIVE: true }],
    ['fly', 'S', "doesn't fly", { NEGATIVE: true, CONTRACT: true }],
    ['play', 'S', 'plays'],
    ['go', 'S', 'goes'],
    ['do', 'S', 'does'],
    ['do', 'S', 'does not', { NEGATIVE: true }],
    ['do', 'P', "don't", { NEGATIVE: true, CONTRACT: true }],
    ['have', 'S', 'has'],
    ['have', 'S', 'does not have', { NEGATIVE: true }],
    ['have', 'S', "doesn't have", { NEGATIVE: true, CONTRACT: true }],
    // Note that in the form without the auxiliary verb DO, the verb HAVE is always contracted with the adverb not.
    ['have', 'S', "hasn't", { NEGATIVE: true, CONTRACT: false, NO_DO: true }],
    ['have', 'S', "hasn't", { NEGATIVE: true, CONTRACT: true, NO_DO: true }],
    ['be', 'S', 'is'],
    ['be', 'P', 'are'],
    ['be', 'S', 'is not', { NEGATIVE: true }],
    ['be', 'S', "isn't", { NEGATIVE: true, CONTRACT: true }],
    ['be', 'P', 'are not', { NEGATIVE: true }],
    ['be', 'P', "aren't", { NEGATIVE: true, CONTRACT: true }],
    ['pass', 'S', 'passes'],
    ['catch', 'S', 'catches'],
    ['fix', 'S', 'fixes'],
    ['push', 'S', 'pushes'],
    ['can', 'S', 'can'],
    // modals: can could may might will would shall should must ought
    ['can', 'S', 'can'],
    ['can', 'S', 'can not', { NEGATIVE: true }],
    ['can', 'S', "can't", { NEGATIVE: true, CONTRACT: true }],
    ['could', 'S', 'could'],
    ['could', 'S', 'could not', { NEGATIVE: true }],
    ['could', 'S', "couldn't", { NEGATIVE: true, CONTRACT: true }],
    ['may', 'S', 'may'],
    ['may', 'S', 'may not', { NEGATIVE: true }],
    ['may', 'S', "mayn't", { NEGATIVE: true, CONTRACT: true }],
    ['might', 'S', 'might'],
    ['might', 'S', 'might not', { NEGATIVE: true }],
    ['might', 'S', "mightn't", { NEGATIVE: true, CONTRACT: true }],
    ['will', 'S', 'will'],
    ['will', 'S', 'will not', { NEGATIVE: true }],
    ['will', 'S', "won't", { NEGATIVE: true, CONTRACT: true }],
    ['would', 'S', 'would'],
    ['would', 'S', 'would not', { NEGATIVE: true }],
    ['would', 'S', "wouldn't", { NEGATIVE: true, CONTRACT: true }],
    ['shall', 'S', 'shall'],
    ['shall', 'S', 'shall not', { NEGATIVE: true }],
    ['shall', 'S', "shan't", { NEGATIVE: true, CONTRACT: true }],
    ['should', 'S', 'should'],
    ['should', 'S', 'should not', { NEGATIVE: true }],
    ['should', 'S', "shouldn't", { NEGATIVE: true, CONTRACT: true }],
    ['must', 'S', 'must'],
    ['must', 'S', 'must not', { NEGATIVE: true }],
    ['must', 'S', "mustn't", { NEGATIVE: true, CONTRACT: true }],
    ['ought', 'S', 'ought'],
    ['ought', 'S', 'ought not', { NEGATIVE: true }],
    ['ought', 'S', "oughtn't", { NEGATIVE: true, CONTRACT: true }],
  ],
  SIMPLE_PRESENT: [['snow', 'S', 'snows']],
  PAST: [
    // regular
    ['listen', 'S', 'listened'],
    ['listen', 'S', 'did not listen', { NEGATIVE: true }],
    ['listen', 'S', "didn't listen", { NEGATIVE: true, CONTRACT: true }],
    ['listen', 'P', 'listened'],
    // irregular
    ['come', 'S', 'came'],
    ['come', 'S', 'did not come', { NEGATIVE: true }],
    ['come', 'P', 'came'],
    ['go', 'S', 'went'],
    ['wake', 'S', 'woke'],
    // be have do
    ['be', 'S', 'was'],
    ['be', 'P', 'were'],
    ['be', 'S', 'was not', { NEGATIVE: true }],
    ['be', 'S', "wasn't", { NEGATIVE: true, CONTRACT: true }],
    ['be', 'P', 'were not', { NEGATIVE: true }],
    ['be', 'P', "weren't", { NEGATIVE: true, CONTRACT: true }],
    ['have', 'S', 'had'],
    ['have', 'P', 'had'],
    ['do', 'S', 'did not', { NEGATIVE: true }],
    ['do', 'S', "didn't", { NEGATIVE: true, CONTRACT: true }],
    ['do', 'P', 'did not', { NEGATIVE: true }],
    ['do', 'P', "didn't", { NEGATIVE: true, CONTRACT: true }],
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
    ['sleep', 'S', 'will not sleep', { NEGATIVE: true }],
    ['sleep', 'S', "won't sleep", { NEGATIVE: true, CONTRACT: true }],
    ['sleep', 'S', 'is going to sleep', { GOING_TO: true }],
    ['sleep', 'S', 'is not going to sleep', { GOING_TO: true, NEGATIVE: true }],
    ['sleep', 'S', "isn't going to sleep", { GOING_TO: true, NEGATIVE: true, CONTRACT: true }],
    ['sleep', 'P', 'are going to sleep', { GOING_TO: true }],
    ['sleep', 'P', "aren't going to sleep", { GOING_TO: true, NEGATIVE: true, CONTRACT: true }],
    ['sleep', 'S', 'will sleep', { WILL: true }],
  ],
  FUTURE: [['rest', 'S', 'will rest']],

  // PROGRESSIVE
  PROGRESSIVE_PAST: [
    ['wonder', 'S', 'was wondering'],
    ['wonder', 'S', 'was not wondering', { NEGATIVE: true }],
    ['wonder', 'S', "wasn't wondering", { NEGATIVE: true, CONTRACT: true }],
    ['get', 'P', 'were getting'],
    ['get', 'P', 'were not getting', { NEGATIVE: true, CONTRACT: false }],
    ['get', 'P', "weren't getting", { NEGATIVE: true, CONTRACT: true }],
  ],
  PROGRESSIVE_PRESENT: [
    ['get', 'S', 'is getting'],
    ['get', 'S', 'is not getting', { NEGATIVE: true }],
    ['frap', 'P', 'are frapping'],
    ['be', 'S', 'is being'],
  ],
  PROGRESSIVE_FUTURE: [
    ['sleep', 'S', 'will be sleeping'],
    ['sleep', 'S', 'will not be sleeping', { NEGATIVE: true, CONTRACT: false }],
    ['sleep', 'S', "won't be sleeping", { NEGATIVE: true, CONTRACT: true }],
    ['save', 'P', 'will be saving'],
  ],

  // PERFECT
  PERFECT_PAST: [
    ['go', 'S', 'had gone'],
    ['go', 'S', 'had not gone', { NEGATIVE: true }],
    ['go', 'S', "hadn't gone", { NEGATIVE: true, CONTRACT: true }],
    ['eat', 'P', 'had eaten'],
  ],
  PERFECT_PRESENT: [
    ['drive', 'S', 'has driven'],
    ['drive', 'S', 'has not driven', { NEGATIVE: true }],
    ['drive', 'S', "hasn't driven", { NEGATIVE: true, CONTRACT: true }],
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
    ['catch', 'P', 'will not have caught', { NEGATIVE: true }],
    ['catch', 'P', "won't have caught", { NEGATIVE: true, CONTRACT: true }],
  ],
  PERFECT_PROGRESSIVE_PAST: [
    ['grow', 'S', 'had been growing'],
    ['grow', 'S', 'had not been growing', { NEGATIVE: true }],
    ['grow', 'S', "hadn't been growing", { NEGATIVE: true, CONTRACT: true }],
    ['let', 'P', 'had been letting'],
  ],
  PERFECT_PROGRESSIVE_PRESENT: [
    ['read', 'S', 'has been reading'],
    ['read', 'S', "hasn't been reading", { NEGATIVE: true, CONTRACT: true }],
    ['light', 'P', 'have been lighting'],
  ],
  PERFECT_PROGRESSIVE_FUTURE: [
    ['check', 'S', 'will have been checking'],
    ['bite', 'P', 'will have been biting'],
    ['bite', 'P', "won't have been biting", { NEGATIVE: true, CONTRACT: true }],
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

const testCasesParticiple = [
  ['take', 'taken'],
  ['refuse', 'refused'],
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
            if (testCase.length > 3) {
              extraParams = testCase[3];
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
    describe('participle present (ing form)', function () {
      for (let i = 0; i < testCasesIng.length; i++) {
        const testCase = testCasesIng[i];
        const verb = testCase[0];
        const expected = testCase[1];
        it(`${verb} => ${expected}`, function () {
          assert.strictEqual(
            EnglishVerbs.getConjugation(resourceGerundsOnly, verb, 'PARTICIPLE_PRESENT', 'S'),
            expected,
          );
        });
      }
    });
    describe('participle', function () {
      for (let i = 0; i < testCasesParticiple.length; i++) {
        const testCase = testCasesParticiple[i];
        const verb = testCase[0];
        const expected = testCase[1];
        it(`${verb} => ${expected}`, function () {
          assert.strictEqual(
            EnglishVerbs.getConjugation(resourceIrregularOnly, verb, 'PARTICIPLE_PAST', 'S'),
            expected,
          );
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
