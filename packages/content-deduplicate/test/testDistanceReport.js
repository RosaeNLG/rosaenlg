const lib = require('../dist/distanceReport.js');
const assert = require('assert');

const texts = [
  {
    id: 1,
    text: 'test bla bla',
  },
  {
    id: 2,
    text: 'test',
  },
  {
    id: 3,
    text: 'manger boire dormir travailler',
  },
  {
    id: 4,
    text: 'test bla bla bli',
  },
];

function getElt(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].for.id == id) {
      return list[i];
    }
  }
  return null;
}

describe('distance reports', function() {
  describe('basic report', function() {
    const report = lib.getDistanceReport(texts, 0.3, 5, 'fr_FR');

    it(`good number of results in the list`, function() {
      assert.equal(report.length, 4);
    });

    it(`1 is close from 4`, function() {
      const elt = getElt(report, 1);
      assert.equal(elt.closestOnes.length, 1);
      assert(elt.closestOnes[0].with.id == 4);
      assert(elt.mostDifferent.with.id == 3);
      assert(elt.mostDifferent.difference == 1);
    });

    it(`2 is different`, function() {
      const elt = getElt(report, 2);
      assert.equal(elt.closestOnes.length, 0);
    });

    it(`4 is close from 1`, function() {
      const elt = getElt(report, 4);
      assert.equal(elt.closestOnes.length, 1);
      assert(elt.closestOnes[0].with.id == 1);
    });

    // console.log(JSON.stringify(report, null, 1));
  });
  describe(`edge cases`, function() {
    it('no texts', () => assert.throws(() => lib.getDistanceReport(null, 0.3, 5, 'fr_FR'), /texts/));
    it('no texts', () => assert.throws(() => lib.getDistanceReport(texts, 0, 5, 'fr_FR'), /acceptable/));
    it('no texts', () => assert.throws(() => lib.getDistanceReport(texts, 0.3, null, 'fr_FR'), /limit/));
  });
});
