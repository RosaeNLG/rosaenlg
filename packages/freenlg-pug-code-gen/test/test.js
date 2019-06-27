var assert = require('assert');
var CodeGenHelper = require('../dist/helper.js').CodeGenHelper;

describe('freenlg-pug-code-gen', function() {
  describe('de_DE', function() {
    describe('getters', function() {
      let helper = new CodeGenHelper('de_DE', true);

      describe('getVerbCandidate', function() {
        it(`verb: 'essen'`, function() {
          assert.equal(helper.getVerbCandidate("getAnonMS(), {verb: 'essen', tense:'PRASENS'}"), 'essen');
        });
        it(`'essen'`, function() {
          assert.equal(helper.getVerbCandidate("getAnonMS(), 'essen'"), 'essen');
        });
        it(`"essen"`, function() {
          assert.equal(helper.getVerbCandidate(`getAnonMS(), "essen"`), 'essen');
        });
      });

      describe('getWordCandidateFromSetRefGender', function() {
        it(`"Gurke"`, function() {
          assert.equal(helper.getWordCandidateFromSetRefGender(`PRODUKT, "Gurke"`), 'Gurke');
        });
        it(`"N"`, function() {
          assert.equal(helper.getWordCandidateFromSetRefGender(`PRODUKT, 'N'`), null);
        });
      });

      describe('getAdjectiveCandidateFromAgreeAdj', function() {
        it(`'alt'`, function() {
          assert.equal(
            helper.getAdjectiveCandidateFromAgreeAdj("'alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'}"),
            'alt',
          );
        });
        it(`no adj`, function() {
          assert.equal(
            helper.getAdjectiveCandidateFromAgreeAdj("getAdj(), 'Gurke', {case:'GENITIVE', det:'DEFINITE'}"),
            null,
          );
        });
      });

      describe('getWordCandidateFromValue', function() {
        it(`'Handy'`, function() {
          assert.equal(helper.getWordCandidateFromValue("'Handy', {represents: PRODUKT}"), 'Handy');
        });
        it(`no represents`, function() {
          assert.equal(helper.getWordCandidateFromValue("'Handy'"), 'Handy');
        });
      });

      describe('getAdjectiveCandidateFromValue', function() {
        it(`'neu'`, function() {
          assert.equal(
            helper.getAdjectiveCandidateFromValue("'Gurke', {case:'GENITIVE', det:'DEFINITE', adj:'neu'}"),
            'neu',
          );
        });
      });
    });

    describe('extractors', function() {
      let helper = new CodeGenHelper('de_DE', true);
      it(`extractWordCandidateFromValue`, function() {
        helper.extractWordCandidateFromValue("'Handy', {represents: PRODUKT}");
        assert(helper.getWordCandidates().indexOf('Handy') > -1);
      });

      it(`extractAdjectiveCandidateFromValue`, function() {
        helper.extractAdjectiveCandidateFromValue("'Gurke', {case:'GENITIVE', det:'DEFINITE', adj:'neu'}");
        assert(helper.getAdjectiveCandidates().indexOf('neu') > -1);
      });

      it(`extractAdjectiveCandidateFromAgreeAdj`, function() {
        helper.extractAdjectiveCandidateFromAgreeAdj("'alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'}");
        assert(helper.getAdjectiveCandidates().indexOf('alt') > -1);
      });

      it(`extractWordCandidateFromSetRefGender`, function() {
        helper.extractWordCandidateFromSetRefGender(`PRODUKT, "Gurke"`);
        assert(helper.getWordCandidates().indexOf('Gurke') > -1);
      });

      it(`extractVerbCandidate`, function() {
        helper.extractVerbCandidate("getAnonMS(), 'essen'");
        assert(helper.getVerbCandidates().indexOf('essen') > -1);
      });

      it(`extractVerbCandidate null`, function() {
        let sizeBefore = helper.getVerbCandidates().length;
        helper.extractVerbCandidate('bla');
        assert(helper.getVerbCandidates().length == sizeBefore);
      });
    });

    describe('get candidates data', function() {
      describe('getVerbCandidatesData', function() {
        let helper = new CodeGenHelper('de_DE', true);
        helper.verbCandidates = ['essen', 'gehen', 'blabla'];
        var verbData = helper.getVerbCandidatesData();
        it(`gegessen ok`, function() {
          assert(JSON.stringify(verbData).indexOf('gegessen') > -1);
        });
        it(`gingst ok`, function() {
          assert(JSON.stringify(verbData).indexOf('gingst') > -1);
        });
      });

      describe('getWordCandidatesData', function() {
        let helper = new CodeGenHelper('de_DE', true);
        helper.wordCandidates = ['Gurke', 'Handy', 'blablaX'];
        var wordData = helper.getWordCandidatesData();
        it(`Gurken ok`, function() {
          assert(JSON.stringify(wordData).indexOf('Gurken') > -1);
        });
        it(`Handys ok`, function() {
          assert(JSON.stringify(wordData).indexOf('Handys') > -1);
        });
      });

      describe('getAdjectiveCandidatesData', function() {
        let helper = new CodeGenHelper('de_DE', true);
        helper.adjectiveCandidates = ['alt', 'dumm', 'blablabla'];
        var adjData = helper.getAdjectiveCandidatesData();
        //console.log(JSON.stringify(adjData));
        it(`dummen ok`, function() {
          assert(JSON.stringify(adjData).indexOf(`dummen`) > -1);
        });
        it(`alten ok`, function() {
          assert(JSON.stringify(adjData).indexOf(`alten`) > -1);
        });
      });
    });

    describe('getAllLinguisticResources', function() {
      let helper = new CodeGenHelper('de_DE', true);
      helper.verbCandidates = ['essen', 'gehen', 'blabla'];
      helper.wordCandidates = ['Gurke', 'Handy'];
      helper.adjectiveCandidates = ['alt', 'dumm'];

      describe('without explicit resources', function() {
        var all = helper.getAllLinguisticResources(null);
        ['gegangen', 'Handys', 'alten'].forEach(function(elt) {
          it(`${elt} ok`, function() {
            assert(JSON.stringify(all).indexOf(elt) > -1);
          });
        });
      });

      describe('with explicit resources', function() {
        let helperTmp = new CodeGenHelper('de_DE', true);
        helperTmp.verbCandidates = ['machen'];
        helperTmp.wordCandidates = ['Telefon'];
        helperTmp.adjectiveCandidates = ['schön'];
        var existingResources = helperTmp.getAllLinguisticResources();

        var all = helper.getAllLinguisticResources(existingResources);
        ['gegangen', 'Handys', 'alten', 'gemacht', 'Telefons', 'schöne'].forEach(function(elt) {
          it(`${elt} ok`, function() {
            assert(JSON.stringify(all).indexOf(elt) > -1);
          });
        });
      });
    });
  });

  describe('it_IT', function() {
    /*
    describe('getters', function() {
      let helper = new CodeGenHelper('fr_FR', true);
      describe('getWordCandidateFromThirdPossession', function() {
        it(`'pureté'`, function() {
          assert.equal(helper.getWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'"), 'pureté');
        });
      });
    });
    describe('extractors', function() {
      let helper = new CodeGenHelper('fr_FR', true);
      it(`extractWordCandidateFromThirdPossession`, function() {
        helper.extractWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'");
        assert(helper.getWordCandidates().indexOf('pureté') > -1);
      });
    });
    */
    describe('extractors', function() {
      let helper = new CodeGenHelper('it_IT', true);
      it(`extractWordCandidateFromValue represents`, function() {
        helper.extractWordCandidateFromValue("'alleanza', {represents: PRODOTTI3}");
        assert(helper.getWordCandidates().indexOf('alleanza') > -1);
      });
      it(`extractWordCandidateFromValue adj`, function() {
        helper.extractWordCandidateFromValue("'torta', {adj:'delizioso', adjPos:'BEFORE', number:'P'}");
        assert(helper.getWordCandidates().indexOf('torta') > -1);
      });
      it(`extractAdjectiveCandidateFromValue`, function() {
        helper.extractAdjectiveCandidateFromValue("'torta', {adj:'delizioso', adjPos:'BEFORE', number:'P'}");
        assert(helper.getAdjectiveCandidates().indexOf('delizioso') > -1);
      });
    });

    describe('get candidates data', function() {
      describe('getWordCandidatesData', function() {
        let helper = new CodeGenHelper('it_IT', true);
        helper.wordCandidates = ['cameriere', 'cameriera', 'blabla'];
        var wordData = helper.getWordCandidatesData();
        //console.log(JSON.stringify(wordData));
        it(`cameriere ok`, function() {
          assert(JSON.stringify(wordData).indexOf(`camerieri`) > -1);
        });
        it(`cameriera ok`, function() {
          assert(JSON.stringify(wordData).indexOf(`cameriere`) > -1);
        });
      });
      describe('getAdjectiveCandidatesData', function() {
        let helper = new CodeGenHelper('it_IT', true);
        helper.adjectiveCandidates = ['azzurro', 'bianco', 'blablabla'];
        var adjData = helper.getAdjectiveCandidatesData();
        //console.log(JSON.stringify(adjData));
        it(`azzurri ok`, function() {
          assert(JSON.stringify(adjData).indexOf(`azzurri`) > -1);
        });
        it(`bianca ok`, function() {
          assert(JSON.stringify(adjData).indexOf(`bianca`) > -1);
        });
      });
    });

    /*
    describe('getAllLinguisticResources', function() {
      let helper = new CodeGenHelper('fr_FR', true);
      helper.verbCandidates = ['manger'];
      helper.wordCandidates = ['perle'];

      var all = helper.getAllLinguisticResources(null);
      ['mangera', `"perle":"F"`].forEach(function(elt) {
        it(`${elt} ok`, function() {
          assert(JSON.stringify(all).indexOf(elt) > -1);
        });
      });
    });
    */
  });

  describe('fr_FR', function() {
    describe('getters', function() {
      let helper = new CodeGenHelper('fr_FR', true);
      describe('getWordCandidateFromThirdPossession', function() {
        it(`'pureté'`, function() {
          assert.equal(helper.getWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'"), 'pureté');
        });
      });
    });

    describe('extractors', function() {
      let helper = new CodeGenHelper('fr_FR', true);
      it(`extractWordCandidateFromThirdPossession`, function() {
        helper.extractWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'");
        assert(helper.getWordCandidates().indexOf('pureté') > -1);
      });
    });

    describe('get candidates data', function() {
      describe('getVerbCandidatesData', function() {
        let helper = new CodeGenHelper('fr_FR', true);
        helper.verbCandidates = ['manger', 'boire', 'blabla'];
        var verbData = helper.getVerbCandidatesData();
        it(`manger ok`, function() {
          assert(JSON.stringify(verbData).indexOf('mangera') > -1);
        });
        it(`buvait ok`, function() {
          assert(JSON.stringify(verbData).indexOf('buvait') > -1);
        });
      });

      describe('getWordCandidatesData', function() {
        let helper = new CodeGenHelper('fr_FR', true);
        helper.wordCandidates = ['perle', 'diamant', 'xxxxx'];
        var wordData = helper.getWordCandidatesData();
        //console.log(JSON.stringify(wordData));
        it(`perle ok`, function() {
          assert(JSON.stringify(wordData).indexOf(`"perle":"F"`) > -1);
        });
        it(`Handys ok`, function() {
          assert(JSON.stringify(wordData).indexOf(`"diamant":"M"`) > -1);
        });
      });
    });

    describe('getAllLinguisticResources', function() {
      let helper = new CodeGenHelper('fr_FR', true);
      helper.verbCandidates = ['manger'];
      helper.wordCandidates = ['perle'];

      var all = helper.getAllLinguisticResources(null);
      ['mangera', `"perle":"F"`].forEach(function(elt) {
        it(`${elt} ok`, function() {
          assert(JSON.stringify(all).indexOf(elt) > -1);
        });
      });
    });
  });

  describe('edge', function() {
    describe('extract without the good language', function() {
      let helper = new CodeGenHelper('en_US', true);
      it(`on getVerbCandidate`, function() {
        assert.equal(helper.getVerbCandidate('bla'), null);
      });
      it(`on getWordCandidateFromSetRefGender`, function() {
        assert.equal(helper.getWordCandidateFromSetRefGender('bla'), null);
      });
      it(`on getAdjectiveCandidateFromAgreeAdj`, function() {
        assert.equal(helper.getAdjectiveCandidateFromAgreeAdj('bla'), null);
      });
      it(`on getAdjectiveCandidateFromValue`, function() {
        assert.equal(helper.getAdjectiveCandidateFromValue('bla'), null);
      });
      it(`on getWordCandidateFromThirdPossession`, function() {
        assert.equal(helper.getWordCandidateFromThirdPossession('bla'), null);
      });
      it(`on getWordCandidateFromValue`, function() {
        assert.equal(helper.getWordCandidateFromValue('bla'), null);
      });
    });
    describe('edge cases', function() {
      let helper = new CodeGenHelper('de_DE', true);
      it('getWordCandidateFromValue represents but no result', function() {
        assert.equal(helper.getWordCandidateFromValue('XXX, {represents: PRODUKT}'), null);
      });
      it('getWordCandidateFromThirdPossession represents but no result', function() {
        assert.equal(helper.getWordCandidateFromThirdPossession('XXX, YYY'), null);
      });
      it('getAdjectiveCandidateFromValue but not found', function() {
        assert.equal(helper.getAdjectiveCandidateFromValue('bla'), null);
      });
      it(`getWordCandidateFromSetRefGender but not found`, function() {
        assert.equal(helper.getWordCandidateFromSetRefGender('bla'), null);
      });
      it(`getVerbCandidate but not found`, function() {
        assert.equal(helper.getVerbCandidate('XXX, YYY'), null);
      });
      it(`getVerbCandidate but not found again`, function() {
        assert.equal(helper.getVerbCandidate('XXX'), null);
      });
    });
  });
});
