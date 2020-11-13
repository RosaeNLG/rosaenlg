const assert = require('assert');
const EnglishPlurals = require('../dist/index.js');
const Irregular = require('english-plurals-list');

const testCasesPlural = [
  ['cat', 'cats'],
  ['house', 'houses'],
  ['truss', 'trusses'],
  ['bus', 'buses'],
  ['marsh', 'marshes'],
  ['lunch', 'lunches'],
  ['tax', 'taxes'],
  ['blitz', 'blitzes'],
  ['fez', 'fezzes'],
  ['gas', 'gasses'],
  ['wife', 'wives'],
  ['wolf', 'wolves'],
  ['roof', 'roofs'],
  ['belief', 'beliefs'],
  ['chef', 'chefs'],
  ['chief', 'chiefs'],
  ['city', 'cities'],
  ['puppy', 'puppies'],
  ['ray', 'rays'],
  ['boy', 'boys'],
  ['potato', 'potatoes'],
  ['tomato', 'tomatoes'],
  ['photo', 'photos'],
  ['piano', 'pianos'],
  ['volcano', 'volcanoes'],
  ['cactus', 'cacti'],
  ['focus', 'foci'],
  ['analysis', 'analyses'],
  ['ellipsis', 'ellipses'],
  ['phenomenon', 'phenomena'],
  ['criterion', 'criteria'],
  ['sheep', 'sheep'],
  ['series', 'series'],
  ['species', 'species'],
  ['deer', 'deer'],
  ['child', 'children'],
  ['goose', 'geese'],
  ['man', 'men'],
  ['woman', 'women'],
  ['tooth', 'teeth'],
  ['foot', 'feet'],
  ['mouse', 'mice'],
  ['person', 'people'],
  ['sex', 'sexes'],
  ['aircraft', 'aircraft'],
  ['patio', 'patios'],
  ['ratio', 'ratios'],
  ['torpedo', 'torpedoes'],
  ['alga', 'algae'],
  ['brother', 'brothers'],
];

describe('english-plurals', function () {
  describe('#getPlural()', function () {
    describe('nominal cases', function () {
      for (let i = 0; i < testCasesPlural.length; i++) {
        const testCase = testCasesPlural[i];
        const singular = testCase[0];
        const expected = testCase[1];
        it(`${singular} => ${expected}`, function () {
          assert.strictEqual(EnglishPlurals.getPlural(null, Irregular, singular), expected);
        });
      }
    });
    describe('word data', function () {
      it(`fishes`, function () {
        const wordData = { fish: { plural: 'fishes' } };
        assert.strictEqual(EnglishPlurals.getPlural(wordData, Irregular, 'fish'), 'fishes');
      });
    });
    describe('halo or haloes?', function () {
      it(`one or the other`, function () {
        const plural = EnglishPlurals.getPlural(null, Irregular, 'halo');
        assert(plural == 'halos' || plural == 'haloes');
      });
    });
    describe('edge cases', function () {
      it(`no word`, function () {
        assert.throws(() => EnglishPlurals.getPlural(null, Irregular, null), /word/);
      });
      it(`no resource`, function () {
        assert.strictEqual(EnglishPlurals.getPlural(null, null, 'child'), 'childs');
      });
    });
  });
});
