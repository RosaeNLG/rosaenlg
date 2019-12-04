const lib = require('../dist/cluster');
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

describe('clusters', function() {
  describe('basic', function() {
    const clusters = lib.getClusters(texts, 2, 'fr_FR');

    it(`first cluster with 1 elt`, function() {
      const cluster = clusters[0];
      assert.equal(cluster.length, 1);
      assert.equal(cluster[0].id, 3);
    });

    it(`other cluster with 3 elts`, function() {
      const cluster = clusters[1];
      assert.equal(cluster.length, 3);
    });

    // console.log(JSON.stringify(clusters, null, 1));
  });
  describe(`edge cases`, function() {
    it('no texts', () => assert.throws(() => lib.getClusters(null, 3, 'fr_FR'), /texts/));
    it('no number of clusters', () => assert.throws(() => lib.getClusters(texts, 0, 'fr_FR'), /number of clusters/));
  });
});
