var assert = require('assert');
var CodeGenHelper = require('../dist/helper.js').CodeGenHelper;

describe('freenlg-pug-code-gen', function() {

  describe('de_DE', function() {
    
    describe('extractors', function() {
      var helper = new CodeGenHelper('de_DE', true);

      describe('extractVerbCandidate', function() {
        it(`verb: 'essen'`, function() {
          assert.equal( helper.extractVerbCandidate("getAnonMS(), {verb: 'essen', tense:'PRASENS'}", "essen") );
        });
        it(`'essen'`, function() {
          assert.equal( helper.extractVerbCandidate("getAnonMS(), 'essen'", "essen") );
        });
        it(`"essen"`, function() {
          assert.equal( helper.extractVerbCandidate(`getAnonMS(), "essen"`, "essen") );
        });
      });
      
      describe('extractWordCandidateFromSetRefGender', function() {
        it(`"Gurke"`, function() {
          assert.equal( helper.extractWordCandidateFromSetRefGender(`PRODUKT, "Gurke"`, "Gurke") );
        });
      });

      describe('extractAdjectiveCandidateFromAgreeAdj', function() {
        it(`'alt'`, function() {
          assert.equal( helper.extractAdjectiveCandidateFromAgreeAdj("'alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'}", "alt") );
        });
        it(`no adj`, function() {
          assert.equal( helper.extractAdjectiveCandidateFromAgreeAdj("getAdj(), 'Gurke', {case:'GENITIVE', det:'DEFINITE'}", null) );
        });
      });

      describe('extractWordCandidateFromValue', function() {
        it(`'Handy'`, function() {
          assert.equal( helper.extractWordCandidateFromValue("'Handy', {represents: PRODUKT}", "Handy") );
        });
        it(`no represents`, function() {
          assert.equal( helper.extractWordCandidateFromValue("'Handy'", null) );
        });
      });

      describe('extractAdjectiveCandidateFromValue', function() {
        it(`'neu'`, function() {
          assert.equal( helper.extractAdjectiveCandidateFromValue("'Gurke', {case:'GENITIVE', det:'DEFINITE', adj:'neu'}", "neu") );
        });
      });
    });

    describe('get candidates data', function() {

      describe('getVerbCandidatesData', function() {
        var helper = new CodeGenHelper('de_DE', true);
        helper.verbCandidates = ['essen', 'gehen', 'blabla'];
        var verbData = helper.getVerbCandidatesData();
        it(`gegessen ok`, function() {
          assert( JSON.stringify(verbData).indexOf('gegessen')>-1 );
        });
        it(`gingst ok`, function() {
          assert( JSON.stringify(verbData).indexOf('gingst')>-1 );
        });
      });

      describe('getWordCandidatesData', function() {
        var helper = new CodeGenHelper('de_DE', true);
        helper.wordCandidates = ['Gurke', 'Handy', 'blablaX'];
        var wordData = helper.getWordCandidatesData();
        it(`Gurken ok`, function() {
          assert( JSON.stringify(wordData).indexOf('Gurken')>-1 );
        });
        it(`Handys ok`, function() {
          assert( JSON.stringify(wordData).indexOf('Handys')>-1 );
        });
      });

      describe('getAdjectiveCandidatesData', function() {
        var helper = new CodeGenHelper('de_DE', true);
        helper.adjectiveCandidates = ['alt', 'dumm', 'blablabla'];
        var adjData = helper.getAdjectiveCandidatesData();
        //console.log(JSON.stringify(adjData));
        it(`dummen ok`, function() {
          assert( JSON.stringify(adjData).indexOf(`dummen`)>-1 );
        });
        it(`alten ok`, function() {
          assert( JSON.stringify(adjData).indexOf(`alten`)>-1 );
        });
      });
    });

    describe('getAllLinguisticResources', function() {
      var helper = new CodeGenHelper('de_DE', true);
      helper.verbCandidates = ['essen', 'gehen', 'blabla'];
      helper.wordCandidates = ['Gurke', 'Handy'];
      helper.adjectiveCandidates = ['alt', 'dumm'];

      describe('without explicit resources', function() {
        var all = helper.getAllLinguisticResources(null);
        ['gegangen', 'Handys', 'alten'].forEach(function(elt) {
          it(`${elt} ok`, function() {
            assert( JSON.stringify(all).indexOf(elt)>-1 );
          });
        });
      });

      describe('with explicit resources', function() {
        var helperTmp = new CodeGenHelper('de_DE', true);
        helperTmp.verbCandidates = ['machen'];
        helperTmp.wordCandidates = ['Telefon'];
        helperTmp.adjectiveCandidates = ['schön'];
        var existingResources = helperTmp.getAllLinguisticResources();

        var all = helper.getAllLinguisticResources(existingResources);
        ['gegangen', 'Handys', 'alten', 'gemacht', 'Telefons', 'schöne'].forEach(function(elt) {
          it(`${elt} ok`, function() {
            assert( JSON.stringify(all).indexOf(elt)>-1 );
          });
        });
      });


    });

  });

  describe('fr_FR', function() {

    describe('extractors', function() {
      var helper = new CodeGenHelper('fr_FR', true);
      describe('extractWordCandidateFromThirdPossession', function() {
        it(`'pureté'`, function() {
          assert.equal( helper.extractWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'", "pureté") );
        });
      });
    });

    describe('get candidates data', function() {

      describe('getVerbCandidatesData', function() {
        var helper = new CodeGenHelper('fr_FR', true);
        helper.verbCandidates = ['manger', 'boire', 'blabla'];
        var verbData = helper.getVerbCandidatesData();
        it(`manger ok`, function() {
          assert( JSON.stringify(verbData).indexOf('mangera')>-1 );
        });
        it(`buvait ok`, function() {
          assert( JSON.stringify(verbData).indexOf('buvait')>-1 );
        });
      });

      describe('getWordCandidatesData', function() {
        var helper = new CodeGenHelper('fr_FR', true);
        helper.wordCandidates = ['perle', 'diamant', 'xxxxx'];
        var wordData = helper.getWordCandidatesData();
        //console.log(JSON.stringify(wordData));
        it(`perle ok`, function() {
          assert( JSON.stringify(wordData).indexOf(`"perle":"F"`)>-1 );
        });
        it(`Handys ok`, function() {
          assert( JSON.stringify(wordData).indexOf(`"diamant":"M"`)>-1 );
        });
      });

    });

    describe('getAllLinguisticResources', function() {
      var helper = new CodeGenHelper('fr_FR', true);
      helper.verbCandidates = ['manger'];
      helper.wordCandidates = ['perle'];

      var all = helper.getAllLinguisticResources(null);
      ['mangera', `"perle":"F"`].forEach(function(elt) {
        it(`${elt} ok`, function() {
          assert( JSON.stringify(all).indexOf(elt)>-1 );
        });
      });
    });

  });

  describe('edge', function() {
    describe('extract without the good language', function() {
      var helper = new CodeGenHelper('en_US', true);
      assert.equal( helper.extractVerbCandidate("bla", null) );
      assert.equal( helper.extractWordCandidateFromSetRefGender("bla", null) );
      assert.equal( helper.extractAdjectiveCandidateFromAgreeAdj("bla", null) );
      assert.equal( helper.extractAdjectiveCandidateFromValue("bla", null) );
      assert.equal( helper.extractWordCandidateFromThirdPossession("bla", null) );
      assert.equal( helper.extractWordCandidateFromValue("bla", null) );

    });

  });

});

