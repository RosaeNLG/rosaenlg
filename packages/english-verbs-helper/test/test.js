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
    // be
    ['be', 0, 'am'],
    ['be', 0, 'am not', { NEGATIVE: true }],
    ['be', 1, 'are'],
    ['be', 2, 'is'],
    ['be', 3, 'are'],
    ['be', 4, 'are'],
    ['be', 5, 'are'],
    // all persons
    ['touch', 0, 'touch'],
    ['touch', 1, 'touch'],
    ['touch', 2, 'touches'],
    ['touch', 3, 'touch'],
    ['touch', 4, 'touch'],
    ['touch', 5, 'touch'],
    // regular
    ['eat', 2, 'eats'],
    ['eat', 2, 'does not eat', { NEGATIVE: true }],
    ['eat', 2, "doesn't eat", { NEGATIVE: true, CONTRACT: true }],
    ['eat', 5, 'eat'],
    ['listen', 2, 'listens'],
    // irregular
    ['fly', 2, 'flies'],
    ['fly', 2, 'does not fly', { NEGATIVE: true }],
    ['fly', 2, "doesn't fly", { NEGATIVE: true, CONTRACT: true }],
    ['play', 2, 'plays'],
    ['go', 2, 'goes'],
    ['do', 2, 'does'],
    ['do', 2, 'does not', { NEGATIVE: true }],
    ['do', 5, "don't", { NEGATIVE: true, CONTRACT: true }],
    ['have', 2, 'has'],
    ['have', 2, 'does not have', { NEGATIVE: true }],
    ['have', 2, "doesn't have", { NEGATIVE: true, CONTRACT: true }],
    // Note that in the form without the auxiliary verb DO, the verb HAVE is always contracted with the adverb not.
    ['have', 2, "hasn't", { NEGATIVE: true, CONTRACT: false, NO_DO: true }],
    ['have', 2, "hasn't", { NEGATIVE: true, CONTRACT: true, NO_DO: true }],
    ['be', 2, 'is'],
    ['be', 5, 'are'],
    ['be', 2, 'is not', { NEGATIVE: true }],
    ['be', 2, "isn't", { NEGATIVE: true, CONTRACT: true }],
    ['be', 5, 'are not', { NEGATIVE: true }],
    ['be', 5, "aren't", { NEGATIVE: true, CONTRACT: true }],
    ['pass', 2, 'passes'],
    ['catch', 2, 'catches'],
    ['fix', 2, 'fixes'],
    ['push', 2, 'pushes'],
    ['can', 2, 'can'],
    // modals: can could may might will would shall should must ought
    ['can', 2, 'can'],
    ['can', 2, 'can not', { NEGATIVE: true }],
    ['can', 2, "can't", { NEGATIVE: true, CONTRACT: true }],
    ['could', 2, 'could'],
    ['could', 2, 'could not', { NEGATIVE: true }],
    ['could', 2, "couldn't", { NEGATIVE: true, CONTRACT: true }],
    ['may', 2, 'may'],
    ['may', 2, 'may not', { NEGATIVE: true }],
    ['may', 2, "mayn't", { NEGATIVE: true, CONTRACT: true }],
    ['might', 2, 'might'],
    ['might', 2, 'might not', { NEGATIVE: true }],
    ['might', 2, "mightn't", { NEGATIVE: true, CONTRACT: true }],
    ['will', 2, 'will'],
    ['will', 2, 'will not', { NEGATIVE: true }],
    ['will', 2, "won't", { NEGATIVE: true, CONTRACT: true }],
    ['would', 2, 'would'],
    ['would', 2, 'would not', { NEGATIVE: true }],
    ['would', 2, "wouldn't", { NEGATIVE: true, CONTRACT: true }],
    ['shall', 2, 'shall'],
    ['shall', 2, 'shall not', { NEGATIVE: true }],
    ['shall', 2, "shan't", { NEGATIVE: true, CONTRACT: true }],
    ['should', 2, 'should'],
    ['should', 2, 'should not', { NEGATIVE: true }],
    ['should', 2, "shouldn't", { NEGATIVE: true, CONTRACT: true }],
    ['must', 2, 'must'],
    ['must', 2, 'must not', { NEGATIVE: true }],
    ['must', 2, "mustn't", { NEGATIVE: true, CONTRACT: true }],
    ['ought', 2, 'ought'],
    ['ought', 2, 'ought not', { NEGATIVE: true }],
    ['ought', 2, "oughtn't", { NEGATIVE: true, CONTRACT: true }],
  ],
  SIMPLE_PRESENT: [['snow', 2, 'snows']],
  PAST: [
    // be
    ['be', 0, 'was'],
    ['be', 0, "wasn't", { NEGATIVE: true, CONTRACT: true }],
    ['be', 1, 'were'],
    ['be', 2, 'was'],
    ['be', 3, 'were'],
    ['be', 4, 'were'],
    ['be', 5, 'were'],
    // all persons
    ['touch', 0, 'touched'],
    ['touch', 1, 'touched'],
    ['touch', 2, 'touched'],
    ['touch', 3, 'touched'],
    ['touch', 4, 'touched'],
    ['touch', 5, 'touched'],
    // regular
    ['listen', 2, 'listened'],
    ['listen', 2, 'did not listen', { NEGATIVE: true }],
    ['listen', 2, "didn't listen", { NEGATIVE: true, CONTRACT: true }],
    ['listen', 5, 'listened'],
    // irregular
    ['come', 2, 'came'],
    ['come', 2, 'did not come', { NEGATIVE: true }],
    ['come', 5, 'came'],
    ['go', 2, 'went'],
    ['wake', 2, 'woke'],
    // be have do
    ['be', 2, 'was'],
    ['be', 5, 'were'],
    ['be', 2, 'was not', { NEGATIVE: true }],
    ['be', 2, "wasn't", { NEGATIVE: true, CONTRACT: true }],
    ['be', 5, 'were not', { NEGATIVE: true }],
    ['be', 5, "weren't", { NEGATIVE: true, CONTRACT: true }],
    ['have', 2, 'had'],
    ['have', 5, 'had'],
    ['do', 2, 'did not', { NEGATIVE: true }],
    ['do', 2, "didn't", { NEGATIVE: true, CONTRACT: true }],
    ['do', 5, 'did not', { NEGATIVE: true }],
    ['do', 5, "didn't", { NEGATIVE: true, CONTRACT: true }],
    ['do', 2, 'did'],
    ['do', 5, 'did'],
    // new ones
    ['marry', 2, 'married'],
    ['cry', 2, 'cried'],
    ['enjoy', 2, 'enjoyed'],
    ['disagree', 2, 'disagreed'],
  ],
  SIMPLE_PAST: [['see', 5, 'saw']],
  SIMPLE_FUTURE: [
    // be
    ['be', 0, 'will be'],
    ['be', 0, 'am going to be', { GOING_TO: true }],
    ['be', 1, 'are going to be', { GOING_TO: true }],
    ['be', 0, 'will not be', { NEGATIVE: true }],
    ['be', 1, 'will be'],
    ['be', 2, 'will be'],
    ['be', 3, 'will be'],
    ['be', 4, 'will be'],
    ['be', 5, 'will be'],
    // all persons
    ['touch', 0, 'will touch'],
    ['touch', 1, 'will touch'],
    ['touch', 2, 'will touch'],
    ['touch', 3, 'will touch'],
    ['touch', 4, 'will touch'],
    ['touch', 5, 'will touch'],
    // tests
    ['sleep', 2, 'will sleep'],
    ['sleep', 5, 'will sleep'],
    ['sleep', 2, 'will not sleep', { NEGATIVE: true }],
    ['sleep', 2, "won't sleep", { NEGATIVE: true, CONTRACT: true }],
    ['sleep', 2, 'is going to sleep', { GOING_TO: true }],
    ['sleep', 2, 'is not going to sleep', { GOING_TO: true, NEGATIVE: true }],
    ['sleep', 2, "isn't going to sleep", { GOING_TO: true, NEGATIVE: true, CONTRACT: true }],
    ['sleep', 5, 'are going to sleep', { GOING_TO: true }],
    ['sleep', 5, "aren't going to sleep", { GOING_TO: true, NEGATIVE: true, CONTRACT: true }],
    ['sleep', 2, 'will sleep', { WILL: true }],
  ],
  FUTURE: [['rest', 2, 'will rest']],

  // PROGRESSIVE
  PROGRESSIVE_PAST: [
    // be
    ['be', 0, 'was being'],
    ['be', 0, 'was not being', { NEGATIVE: true }],
    ['be', 1, 'were being'],
    ['be', 2, 'was being'],
    ['be', 3, 'were being'],
    ['be', 4, 'were being'],
    ['be', 5, 'were being'],
    // all persons
    ['touch', 0, 'was touching'],
    ['touch', 1, 'were touching'],
    ['touch', 2, 'was touching'],
    ['touch', 3, 'were touching'],
    ['touch', 4, 'were touching'],
    ['touch', 5, 'were touching'],
    // tests
    ['wonder', 2, 'was wondering'],
    ['wonder', 2, 'was not wondering', { NEGATIVE: true }],
    ['wonder', 2, "wasn't wondering", { NEGATIVE: true, CONTRACT: true }],
    ['get', 5, 'were getting'],
    ['get', 5, 'were not getting', { NEGATIVE: true, CONTRACT: false }],
    ['get', 5, "weren't getting", { NEGATIVE: true, CONTRACT: true }],
  ],
  PROGRESSIVE_PRESENT: [
    // be
    ['be', 0, 'am being'],
    ['be', 0, 'am not being', { NEGATIVE: true }],
    ['be', 1, 'are being'],
    ['be', 2, 'is being'],
    ['be', 3, 'are being'],
    ['be', 4, 'are being'],
    ['be', 5, 'are being'],
    // all persons
    ['touch', 0, 'am touching'],
    ['touch', 1, 'are touching'],
    ['touch', 2, 'is touching'],
    ['touch', 3, 'are touching'],
    ['touch', 4, 'are touching'],
    ['touch', 5, 'are touching'],
    ['get', 2, 'is getting'],
    ['get', 2, 'is not getting', { NEGATIVE: true }],
    ['frap', 5, 'are frapping'],
    ['be', 2, 'is being'],
  ],
  PROGRESSIVE_FUTURE: [
    ['be', 0, 'will be being'],
    ['sleep', 2, 'will be sleeping'],
    ['sleep', 2, 'will not be sleeping', { NEGATIVE: true, CONTRACT: false }],
    ['sleep', 2, "won't be sleeping", { NEGATIVE: true, CONTRACT: true }],
    ['save', 5, 'will be saving'],
  ],

  // PERFECT
  PERFECT_PAST: [
    ['be', 0, 'had been'],
    ['be', 1, 'had been'],
    ['go', 2, 'had gone'],
    ['go', 2, 'had not gone', { NEGATIVE: true }],
    ['go', 2, "hadn't gone", { NEGATIVE: true, CONTRACT: true }],
    ['eat', 5, 'had eaten'],
  ],
  PERFECT_PRESENT: [
    ['be', 0, 'have been'],
    ['be', 1, 'have been'],
    ['be', 2, 'has been'],
    ['drive', 2, 'has driven'],
    ['drive', 2, 'has not driven', { NEGATIVE: true }],
    ['drive', 2, "hasn't driven", { NEGATIVE: true, CONTRACT: true }],
    ['see', 5, 'have seen'],
    ['be', 5, 'have been'],
    ['refuse', 2, 'has refused'],
    ['create', 2, 'has created'],
    ['dye', 2, 'has dyed'],
    ['hoe', 2, 'has hoed'],
    ['singe', 2, 'has singed'],
    ['die', 2, 'has died'],
    ['disagree', 2, 'has disagreed'],
  ],
  PERFECT_FUTURE: [
    ['be', 0, 'will have been'],
    ['watch', 2, 'will have watched'],
    ['catch', 5, 'will have caught'],
    ['catch', 5, 'will not have caught', { NEGATIVE: true }],
    ['catch', 5, "won't have caught", { NEGATIVE: true, CONTRACT: true }],
  ],
  PERFECT_PROGRESSIVE_PAST: [
    ['be', 0, 'had been being'],
    ['grow', 2, 'had been growing'],
    ['grow', 2, 'had not been growing', { NEGATIVE: true }],
    ['grow', 2, "hadn't been growing", { NEGATIVE: true, CONTRACT: true }],
    ['let', 5, 'had been letting'],
  ],
  PERFECT_PROGRESSIVE_PRESENT: [
    ['be', 0, 'have been being'],
    ['be', 2, 'has been being'],
    ['read', 2, 'has been reading'],
    ['read', 2, "hasn't been reading", { NEGATIVE: true, CONTRACT: true }],
    ['light', 5, 'have been lighting'],
  ],
  PERFECT_PROGRESSIVE_FUTURE: [
    ['be', 2, 'will have been being'],
    ['check', 2, 'will have been checking'],
    ['bite', 5, 'will have been biting'],
    ['bite', 5, "won't have been biting", { NEGATIVE: true, CONTRACT: true }],
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
            const person = testCase[1];
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

            it(`${verb} ${tense} ${person} ${
              extraParams ? JSON.stringify(extraParams) : ''
            } => ${expected}`, function () {
              assert.strictEqual(
                EnglishVerbs.getConjugation(resourceToUse, verb, tense, person, extraParams),
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
          assert.strictEqual(EnglishVerbs.getConjugation(resourceGerundsOnly, verb, 'PARTICIPLE_PRESENT', 2), expected);
        });
      }
    });
    describe('participle', function () {
      for (let i = 0; i < testCasesParticiple.length; i++) {
        const testCase = testCasesParticiple[i];
        const verb = testCase[0];
        const expected = testCase[1];
        it(`${verb} => ${expected}`, function () {
          assert.strictEqual(EnglishVerbs.getConjugation(resourceIrregularOnly, verb, 'PARTICIPLE_PAST', 2), expected);
        });
      }
    });
    describe('negative participle', function () {
      it(`present`, function () {
        assert.strictEqual(
          EnglishVerbs.getConjugation(resourceGerundsOnly, 'go', 'PARTICIPLE_PRESENT', 2, { NEGATIVE: true }),
          'not going',
        );
      });
      it(`past`, function () {
        assert.strictEqual(
          EnglishVerbs.getConjugation(resourceIrregularOnly, 'go', 'PARTICIPLE_PAST', 2, { NEGATIVE: true }),
          'not gone',
        );
      });
    });

    describe('edge cases', function () {
      it(`null verb`, function () {
        assert.throws(() => EnglishVerbs.getConjugation(null, null, 'PRESENT', 2), /verb/);
      });
      it(`invalid person`, function () {
        assert.throws(() => EnglishVerbs.getConjugation(null, 'eat', 'PRESENT', 12), /person/);
      });
      it(`invalid tense`, function () {
        assert.throws(() => EnglishVerbs.getConjugation(null, 'eat', 'PLUS_QUE_BLABLA', 2), /tense/);
      });
      it(`no verbs info`, function () {
        assert.strictEqual(EnglishVerbs.getConjugation(null, 'go', 'PERFECT_FUTURE', 2), 'will have goed');
      });
      it(`resource combination`, function () {
        const resourceBoth = EnglishVerbs.mergeVerbsData(EnglishVerbsIrregular, EnglishGerunds);
        assert.strictEqual(EnglishVerbs.getConjugation(resourceBoth, 'swim', 'PROGRESSIVE_PRESENT', 2), 'is swimming');
        assert.strictEqual(EnglishVerbs.getConjugation(resourceBoth, 'swim', 'SIMPLE_PAST', 2), 'swam');
        assert.strictEqual(EnglishVerbs.getConjugation(resourceBoth, 'swim', 'PERFECT_PRESENT', 2), 'has swum');
      });
    });
  });
});
