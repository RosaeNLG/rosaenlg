const assert = require('assert');
const EnglishAAn = require('../dist/index.js');
const EnglishAAnList = require('english-a-an-list');

const testCases = [
  'a boy',
  'a car',
  'a bike',
  'a zoo',
  'a dog',
  'an elephant',
  'an egg',
  'an apple',
  'an idiot',
  'an orphan',
  'a user',
  'a university',
  'a University',
  'a unicycle',
  'an hour',
  'a horse',
  'a historical',
  'a broken',
  'an unusual',
  'a European',
  'an Irishman',
  'an SSO',
  'an HEPA',
  'a one-armed',
  'an heir',
  'a unicorn',
  'an herb',
  'a unionized worker',
  'a hotel',
  'a helmet',
  'an English',
  'an AI',
  'an honor',
  'an honour',
  'an AND',
];

describe('english-a-an', function() {
  describe('nominal', function() {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const splitted = testCase.split(' ');
      const expected = splitted[0];
      const word = splitted[1];
      it(`${testCase}`, function() {
        assert.equal(EnglishAAn.getAAn(EnglishAAnList, word), expected);
      });
    }
  });
  describe('edge cases', function() {
    it('empty list is ok', function() {
      assert.equal(EnglishAAn.getAAn(null, 'boy'), 'a');
    });
    it('empty word not ok', function() {
      assert.throws(() => EnglishAAn.getAAn(EnglishAAnList, null), /text/);
    });
  });
});
