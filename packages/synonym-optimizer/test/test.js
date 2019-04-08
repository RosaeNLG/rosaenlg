var lib = require('../dist/index.js');
var assert = require('assert');

const extractedWords = {
  "Bonjour. Je suis très content, j'ai mangé une bonne salade!!!": ['Bonjour', 'Je', 'suis', 'très', 'content', 'j\'ai', 'mangé', 'une', 'bonne', 'salade'],
  "bla.bla": ['bla','bla'],
  "... et : alors!": ['et', 'alors'],
};

const wordsWithPos = [
  [ ['bla', 'alors', 'bla', 'bli', 'xxx', 'xxx', 'yyy'], null, {'bla':[0,2], 'alors':[1], 'bli':[3], 'xxx':[4,5], 'yyy':[6]} ],
  [ ['bla', 'bla', 'je', 'ai', 'bla'], null, {'bla':[0,1,4], 'je':[2], 'ai':[3]} ],
  [ ['bla', 'bli', 'blu'], null, {'bla':[0], 'bli':[1], 'blu':[2]} ],
  [ ['bla', 'bli', 'blu'], [ ['bla', 'blu'] ], {'bla_blu':[0,2], 'bli':[1]} ],
];

const scores = [
  [ {'bla':[0,1,4], 'je':[2], 'ai':[3,5,6]}, 2.83 ],
  [ {'bla':[0], 'bli':[1], 'blu':[2]}, 0 ]
];

const globalTests = [
  [ 'fr_FR', ['bla bla bla', 'bli bla bla'], 1 ],
  [ 'fr_FR', ['bla bli bla', 'bla bla bli'], 0 ],
];

describe('synonym-optimizer', function() {

  describe('#getStandardStopWords', function() {
    it('alors / fr', function() {
      assert( lib.getStandardStopWords('fr_FR').includes('alors') )
    });

    it(`invalid language`, function() { assert.throws( () => lib.getStandardStopWords('latin'), /language/ ) });
  });

  describe('#getStopWords', function() {
    it('specific list', function() {
      assert.deepEqual( lib.getStopWords(null, null, null, ['xx', 'yy']), ['xx', 'yy'])
    });
    it('remove', function() {
      assert( ! lib.getStopWords('fr_FR', null, 'alors', null).includes('alors') )
    });
    it('add', function() {
      assert( lib.getStopWords('fr_FR', 'blabla', null, null).includes('blabla') )
    });

  });
  
  describe('#extractWords', function() {
    Object.keys(extractedWords).forEach(function(key) {
      const vals = extractedWords[key];
      it(`${key} => ${JSON.stringify(vals)}`, function() {
        assert.deepEqual( lib.extractWords(key), vals )
      });    

    });
  });

  describe('#getWordsWithPos', function() {

    describe('nominal', function() {
      wordsWithPos.forEach(function(testCase) {
        const input = testCase[0];
        const identicals = testCase[1];
        const expected = testCase[2];
        it(`${input}`, function() {
          assert.deepEqual( lib.getWordsWithPos(input, identicals), expected )
        });    
      });
    });


    describe('edge', function() {
      it(`identicals not string[]`, function() { assert.throws( () => lib.getWordsWithPos(['bla'], 'bla'), /string/ ) });
      it(`identicals not string[][]`, function() { assert.throws( () => lib.getWordsWithPos(['bla'], ['bla']), /string/ ) });
    });


  });

  
  describe('#getScore', function() {
    scores.forEach(function(testCase) {
      const input = testCase[0];
      const expected = testCase[1];
      it(`${JSON.stringify(input)} => ~${expected}`, function() {
        assert( Math.abs(lib.getScore(input)-expected) < 0.01 )
      });
    });

  });
  
  describe('#getBest', function() {
    globalTests.forEach(function(testCase) {
      const lang = testCase[0];
      const input = testCase[1];
      const expected = testCase[2];
      it(`some test in ${lang} => ${expected}`, function() {
        assert.equal(lib.getBest(lang, input, null, null, null, null, null), expected);
      });
    });
  });

  describe('#scoreAlternative', function() {
    it(`with debug`, function() {
      let debug = {};
      lib.scoreAlternative('fr_FR', 'AAA AAA', null, null, null, null, debug);
      assert.equal(debug.score, 1);
    });
  
    it(`identiticals`, function() {
      // without
      assert.equal(
        lib.scoreAlternative('fr_FR', 'phone cellphone smartphone bla bla', null, null, null, 
          null, null),
          1
      );

      // with
      assert.equal(
        lib.scoreAlternative('fr_FR', 'phone cellphone smartphone bla bla', null, null, null, 
        [ ['phone', 'cellphone', 'smartphone'] ], null),
          3
      );      

    });
  });


});

