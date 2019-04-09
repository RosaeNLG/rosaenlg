var lib = require('../dist/index.js');
var assert = require('assert');

const extractedWords = {
  "Bonjour. Je suis très content, j'ai mangé une bonne salade!!!": ['Bonjour', 'Je', 'suis', 'très', 'content', 'j\'ai', 'mangé', 'une', 'bonne', 'salade'],
  "bla.bla": ['bla','bla'],
  "... et : alors!": ['et', 'alors'],
};

const wordsWithPos = [
  [ 'fr_FR', ['bla', 'alors', 'bla', 'bli', 'xxx', 'xxx', 'yyy'], null, {'bla':[0,2], 'alors':[1], 'bli':[3], 'xxx':[4,5], 'yyy':[6]} ],
  [ 'fr_FR', ['bla', 'bla', 'je', 'ai', 'bla'], null, {'bla':[0,1,4], 'je':[2], 'ai':[3]} ],
  [ 'en_US', ['bla', 'bli', 'blu'], null, {'bla':[0], 'bli':[1], 'blu':[2]} ],
  [ 'en_US', ['bla', 'bli', 'blu'], [ ['bla', 'blu'] ], {'bla_blu':[0,2], 'bli':[1]} ],
];

const scores = [
  [ {'bla':[0,1,4], 'je':[2], 'ai':[3,5,6]}, 2.83 ],
  [ {'bla':[0], 'bli':[1], 'blu':[2]}, 0 ]
];

const globalTests = [
  [ 'fr_FR', ['bla bla bla', 'bli bla bla'], 1 ],
  [ 'fr_FR', ['bla bli bla', 'bla bla bli'], 0 ],
];

const scoreAlternativeTests = [
  [ 'en_US', 'arms arm', 1],
  [ 'en_US', 'he eats they eat', 1],
  [ 'en_US', 'I engineered I engineer', 1],
  [ 'fr_FR', 'bonjour test', 0],
  [ 'fr_FR', 'poubelle alors alors alors poubelles', 1],
  [ 'fr_FR', 'allée allé', 1],
  [ 'de_DE', 'katholik katholische katholischen', 2],
]

describe('synonym-optimizer', function() {

  describe('#getStandardStopWords', function() {
    it('alors / fr', function() {
      assert( lib.getStandardStopWords('fr_FR').includes('alors') )
    });

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
        const lang = testCase[0];
        const input = testCase[1];
        const identicals = testCase[2];
        const expected = testCase[3];
        it(`${input}`, function() {
          assert.deepEqual( lib.getWordsWithPos(lang, input, identicals), expected )
        });    
      });
    });


    describe('edge', function() {
      it(`identicals not string[]`, function() { assert.throws( () => lib.getWordsWithPos('en_US', ['bla'], 'bla'), /string/ ) });
      it(`identicals not string[][]`, function() { assert.throws( () => lib.getWordsWithPos('en_US', ['bla'], ['bla']), /string/ ) });
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
    
    scoreAlternativeTests.forEach(function(testCase) {
      const language = testCase[0];
      const input = testCase[1];
      const expectedScore = testCase[2];

      it(`${language} ${input} => ${expectedScore}`, function() {
        let debugHolder = {};
        let score = lib.scoreAlternative(language, input, null, null, null, null, debugHolder);
        //console.log(debugHolder);
        assert.equal(score, expectedScore);
      });
  
    });
    
    

    it(`with debug`, function() {
      let debug = {};
      lib.scoreAlternative('fr_FR', 'AAA AAA', null, null, null, null, debug);
      assert.equal(debug.score, 1);
    });
  
    const forIdenticalsTest = 'phone cellphone smartphone bla bla';
    it(`identicals - without`, function() {
      assert.equal(
        lib.scoreAlternative('fr_FR', forIdenticalsTest, null, null, null, 
          null, null),
          1
      );
    });
    it(`identicals - with`, function() {
      let debugHolder = {};
      const score = lib.scoreAlternative('fr_FR', forIdenticalsTest, null, null, null, 
      [ ['phone', 'cellphone', 'smartphone'] ], debugHolder);
      //console.log(debugHolder);
      assert.equal(score, 3);
    });

    it(`invalid language`, function() { assert.throws( () => 
      lib.scoreAlternative('latin', 'bla', null, null, null, null, null), /language/
    ) });

  });


});

