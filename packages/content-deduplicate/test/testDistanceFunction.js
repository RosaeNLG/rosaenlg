const lib = require('../dist/distance.js');
const assert = require('assert');

const distanceCases = [
  ['en_US', 'Kxx Bxx Dxx Axx Cxx Uxx Vxx Zxx', 'Pxx Axx Cxx Uxx Uxx Vxx Kxx Bxx', 6],
  ['fr_FR', 'test toto bla', 'test toto bli', 2],
  ['fr_FR', 'bla bla bla', 'bli bli bli', 6],
  ['fr_FR', 'test toto', 'test toto bli', 1],
  ['fr_FR', 'bli blu blo', 'toto tata titi tyty', 7],
  ['fr_FR', 'je vais et je viens', 'je vais et je viens puis je me balade', 1],
  ['en_US', 'AAA AAA AAA BBB AAA XXX', 'AAA AAA BBB UUU PPP', 5],
  ['en_US', 'AAA BBB CCC KKK PPP OOO', 'ZZZ AAA BBB CCC PPP OOO', 3],
  ['en_US', 'AAA it 5 he', 'AAA', 0],
  ['en_US', 'he has 5', 'it has 6', 0],
];

function assertDistTriangle(a, b, c, lang) {
  it(`${lang} a: <${a}> b: <${b}> c: <${c}>`, function() {
    assert(lib.getDistanceRaw(a, b, lang) <= lib.getDistanceRaw(a, c, lang) + lib.getDistanceRaw(c, b, lang));
  });
}

describe('distance function', function() {
  describe(`classic test cases`, function() {
    distanceCases.forEach(function(distanceCase) {
      const lang = distanceCase[0];
      const s1 = distanceCase[1];
      const s2 = distanceCase[2];
      const expected = distanceCase[3];
      describe(`${lang} <${s1}> <${s2}>`, function() {
        it(`dist(a,b)=${expected}`, function() {
          assert.equal(lib.getDistanceRaw(s1, s2, lang), expected);
        });
        it(`dist(b,a) same`, function() {
          assert.equal(lib.getDistanceRaw(s2, s1, lang), expected);
        });
        it(`dist(a,a)=0`, function() {
          assert.equal(lib.getDistanceRaw(s1, s1, lang), 0);
          assert.equal(lib.getDistanceRaw(s2, s2, lang), 0);
        });
      });
    });
  });
  describe(`percentage with limit`, function() {
    // same strings to be sure that cache is not kept
    const s1 = 'I eat huge quantities of vegetables and I love wine, beer and pineapples';
    const s2 = 'he eats huge quantities of meat and I love wine, coca-cola, and pineapples';
    it(`real % calculation`, function() {
      const dist = lib.getDistancePourcentage(s1, s2, null, 'en_US');
      // 0.4117647058823529
      assert(dist > 0.41);
      assert(dist < 0.42);
    });
    it(`% with max dist should be 1`, function() {
      // strings must be different otherwise cache will do the job
      const dist = lib.getDistancePourcentage(s1, s2, 0.1, 'en_US');
      assert.equal(dist, 1);
    });
  });
  describe(`dist(a,b) <= dist(a,c) + dist(c,b)`, function() {
    for (let i = 1; i < distanceCases.length; i++) {
      distanceCase = distanceCases[i];
      distanceCasePrev = distanceCases[i - 1];

      // NB we don't care for distanceCasePrev language
      const lang = distanceCase[0];
      const a = distanceCase[1];
      const b = distanceCase[2];
      const c1 = distanceCasePrev[1];
      const c2 = distanceCasePrev[2];

      assertDistTriangle(a, b, c1, lang);
      assertDistTriangle(a, b, c2, lang);
    }
  });
  describe(`edge cases`, function() {
    it('no lang', () => assert.throws(() => lib.getDistanceRaw('a', 'b'), /lang/));
  });
});
