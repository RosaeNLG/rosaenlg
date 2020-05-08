const assert = require('assert');
const CodeGenHelper = require('../dist/helper.js').CodeGenHelper;

describe('rosaenlg-pug-code-gen', function () {
  describe('de_DE', function () {
    describe('getters', function () {
      const helper = new CodeGenHelper('de_DE', true);

      describe('getVerbCandidate', function () {
        it(`verb: 'essen'`, function () {
          assert.equal(helper.getVerbCandidate("getAnonMS(), {verb: 'essen', tense:'PRASENS'}"), 'essen');
        });
        it(`verb: 'essen' with 'verb:'`, function () {
          assert.equal(helper.getVerbCandidate("getAnonMS(), {'verb' : 'essen', tense:'FUTUR'}"), 'essen');
        });
        it(`verb: 'essen' inverted`, function () {
          assert.equal(helper.getVerbCandidate("getAnonMS(), {tense:'PRASENS', verb: 'essen'}"), 'essen');
        });
        it(`'essen'`, function () {
          assert.equal(helper.getVerbCandidate("getAnonMS(), 'essen'"), 'essen');
        });
        it(`"essen"`, function () {
          assert.equal(helper.getVerbCandidate(`getAnonMS(), "essen"`), 'essen');
        });
        it(`"essen" with strange beginning`, function () {
          assert.equal(helper.getVerbCandidate(`getAnonMS() + 36 + blabla, "essen"`), 'essen');
        });
        it(`invalid raw essen`, function () {
          assert.deepEqual(helper.getVerbCandidate(`blabla, essen`), []);
        });
        it(`invalid verb: essen`, function () {
          assert.deepEqual(helper.getVerbCandidate(`blabla, {verb: essen}`), []);
        });
      });

      describe('getWordCandidateFromSetRefGender', function () {
        it(`"Gurke"`, function () {
          assert.equal(helper.getWordCandidateFromSetRefGender(`PRODUKT, "Gurke"`), 'Gurke');
        });
        it(`"N"`, function () {
          assert.equal(helper.getWordCandidateFromSetRefGender(`PRODUKT, 'N'`), null);
        });
      });

      describe('getAdjectiveCandidateFromAgreeAdj', function () {
        it(`'alt'`, function () {
          assert.equal(
            helper.getAdjectiveCandidateFromAgreeAdj("'alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'}"),
            'alt',
          );
        });
        it(`no adj`, function () {
          assert.deepEqual(
            helper.getAdjectiveCandidateFromAgreeAdj("getAdj(), 'Gurke', {case:'GENITIVE', det:'DEFINITE'}"),
            [],
          );
        });
      });

      describe('getWordCandidateFromValue', function () {
        it(`'Handy'`, function () {
          assert.equal(helper.getWordCandidateFromValue("'Handy', {represents: PRODUKT}"), 'Handy');
        });
        it(`no represents`, function () {
          assert.equal(helper.getWordCandidateFromValue("'Handy'"), 'Handy');
        });
      });

      describe('getAdjectiveCandidatesFromValue', function () {
        it(`'neu'`, function () {
          assert.equal(
            helper.getAdjectiveCandidatesFromValue("'Gurke', {case:'GENITIVE', det:'DEFINITE', adj:'neu'}")[0],
            'neu',
          );
        });
      });
    });

    describe('extractors', function () {
      const helper = new CodeGenHelper('de_DE', true);
      it(`extractWordCandidateFromValue`, function () {
        helper.extractWordCandidateFromValue("'Handy', {represents: PRODUKT}");
        assert(helper.getWordCandidates().indexOf('Handy') > -1);
      });

      it(`extractAdjectiveCandidateFromValue`, function () {
        helper.extractAdjectiveCandidateFromValue("'Gurke', {case:'GENITIVE', det:'DEFINITE', adj:'neu'}");
        assert(helper.getAdjectiveCandidates().indexOf('neu') > -1);
      });

      it(`extractAdjectiveCandidateFromAgreeAdj`, function () {
        helper.extractAdjectiveCandidateFromAgreeAdj("'alt', 'Gurke', {case:'GENITIVE', det:'DEFINITE'}");
        assert(helper.getAdjectiveCandidates().indexOf('alt') > -1);
      });

      it(`extractWordCandidateFromSetRefGender`, function () {
        helper.extractWordCandidateFromSetRefGender(`PRODUKT, "Gurke"`);
        assert(helper.getWordCandidates().indexOf('Gurke') > -1);
      });

      it(`extractVerbCandidate`, function () {
        helper.extractVerbCandidate("getAnonMS(), 'essen'");
        assert(helper.getVerbCandidates().indexOf('essen') > -1);
      });

      it(`extractVerbCandidate null`, function () {
        const sizeBefore = helper.getVerbCandidates().length;
        assert.throws(() => helper.extractVerbCandidate('bla'), /should have at least 2/);
        assert(helper.getVerbCandidates().length === sizeBefore);
      });
    });

    describe('get candidates data', function () {
      describe('getVerbCandidatesData', function () {
        const helper = new CodeGenHelper('de_DE', true);
        helper.verbCandidates = ['essen', 'gehen', 'blabla'];
        const verbData = helper.getVerbCandidatesData();
        it(`gegessen ok`, function () {
          assert(JSON.stringify(verbData).indexOf('gegessen') > -1);
        });
        it(`gingst ok`, function () {
          assert(JSON.stringify(verbData).indexOf('gingst') > -1);
        });
      });

      describe('getWordCandidatesData', function () {
        const helper = new CodeGenHelper('de_DE', true);
        helper.wordCandidates = ['Gurke', 'Handy', 'blablaX'];
        const wordData = helper.getWordCandidatesData();
        it(`Gurken ok`, function () {
          assert(JSON.stringify(wordData).indexOf('Gurken') > -1);
        });
        it(`Handys ok`, function () {
          assert(JSON.stringify(wordData).indexOf('Handys') > -1);
        });
      });

      describe('getAdjectiveCandidatesData', function () {
        const helper = new CodeGenHelper('de_DE', true);
        helper.adjectiveCandidates = ['alt', 'dumm', 'blablabla'];
        const adjData = helper.getAdjectiveCandidatesData();
        //console.log(JSON.stringify(adjData));
        it(`dummen ok`, function () {
          assert(JSON.stringify(adjData).indexOf(`dummen`) > -1);
        });
        it(`alten ok`, function () {
          assert(JSON.stringify(adjData).indexOf(`alten`) > -1);
        });
      });
    });

    describe('getAllLinguisticResources', function () {
      const helper = new CodeGenHelper('de_DE', true);
      helper.verbCandidates = ['essen', 'gehen', 'blabla'];
      helper.wordCandidates = ['Gurke', 'Handy'];
      helper.adjectiveCandidates = ['alt', 'dumm'];

      describe('without explicit resources', function () {
        const all = helper.getAllLinguisticResources(null);
        ['gegangen', 'Handys', 'alten'].forEach(function (elt) {
          it(`${elt} ok`, function () {
            assert(JSON.stringify(all).indexOf(elt) > -1);
          });
        });
      });

      describe('with explicit resources', function () {
        const helperTmp = new CodeGenHelper('de_DE', true);
        helperTmp.verbCandidates = ['machen'];
        helperTmp.wordCandidates = ['Telefon'];
        helperTmp.adjectiveCandidates = ['schön'];
        const existingResources = helperTmp.getAllLinguisticResources();

        const all = helper.getAllLinguisticResources(existingResources);
        ['gegangen', 'Handys', 'alten', 'gemacht', 'Telefons', 'schöne'].forEach(function (elt) {
          it(`${elt} ok`, function () {
            assert(JSON.stringify(all).indexOf(elt) > -1);
          });
        });
      });
    });
  });

  describe('it_IT', function () {
    describe('getters', function () {
      const helper = new CodeGenHelper('it_IT', true);
      describe('getVerbCandidate', function () {
        it(`verb: 'mangiare'`, function () {
          assert.equal(helper.getVerbCandidate("getAnonMS(), {verb: 'mangiare', tense:'PRESENTE'}"), 'mangiare');
        });
      });
    });
    /*
    describe('extractors', function() {
      let helper = new CodeGenHelper('fr_FR', true);
      it(`extractWordCandidateFromThirdPossession`, function() {
        helper.extractWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'");
        assert(helper.getWordCandidates().indexOf('pureté') > -1);
      });
    });
    */
    describe('extractors', function () {
      const helper = new CodeGenHelper('it_IT', true);
      it(`extractWordCandidateFromValue represents`, function () {
        helper.extractWordCandidateFromValue("'alleanza', {represents: PRODOTTI3}");
        assert(helper.getWordCandidates().indexOf('alleanza') > -1);
      });
      it(`extractWordCandidateFromValue adj`, function () {
        helper.extractWordCandidateFromValue("'torta', {adj:'delizioso', adjPos:'BEFORE', number:'P'}");
        assert(helper.getWordCandidates().indexOf('torta') > -1);
      });
      it(`extractAdjectiveCandidateFromValue`, function () {
        helper.extractAdjectiveCandidateFromValue("'torta', {adj:'delizioso', adjPos:'BEFORE', number:'P'}");
        assert(helper.getAdjectiveCandidates().indexOf('delizioso') > -1);
      });
      it(`extractAdjectiveCandidateFromValue`, function () {
        const candidates = helper.getAdjectiveCandidatesFromValue(
          "'mucca', {det: 'DEFINITE', adj:'blu', adjPos:'AFTER', possessiveAdj:'mio'}",
        );
        assert(candidates.length === 2);
        assert(candidates.indexOf('mio') > -1);
        assert(candidates.indexOf('blu') > -1);
      });
      it(`invalid possessiveAdj`, function () {
        const candidates = helper.getAdjectiveCandidatesFromValue(
          "'mucca', {det: 'DEFINITE', adj:'blu', adjPos:'AFTER', possessiveAdj:getPossAdj()}",
        );
        assert(candidates.length === 1);
        assert(candidates.indexOf('blu') > -1);
      });
    });

    describe('get candidates data', function () {
      describe('getVerbCandidatesData', function () {
        const helper = new CodeGenHelper('it_IT', true);
        helper.verbCandidates = ['mangiare', 'venire', 'XXXX'];
        const verbData = helper.getVerbCandidatesData();
        it(`mangiava ok`, function () {
          assert(JSON.stringify(verbData).indexOf('mangiava') > -1);
        });
        it(`venni ok`, function () {
          assert(JSON.stringify(verbData).indexOf('venni') > -1);
        });
      });

      describe('getWordCandidatesData', function () {
        const helper = new CodeGenHelper('it_IT', true);
        helper.wordCandidates = ['cameriere', 'cameriera', 'blabla'];
        const wordData = helper.getWordCandidatesData();
        //console.log(JSON.stringify(wordData));
        it(`cameriere ok`, function () {
          assert(JSON.stringify(wordData).indexOf(`camerieri`) > -1);
        });
        it(`cameriera ok`, function () {
          assert(JSON.stringify(wordData).indexOf(`cameriere`) > -1);
        });
      });
      describe('getAdjectiveCandidatesData', function () {
        const helper = new CodeGenHelper('it_IT', true);
        helper.adjectiveCandidates = ['azzurro', 'bianco', 'blablabla'];
        const adjData = helper.getAdjectiveCandidatesData();
        //console.log(JSON.stringify(adjData));
        it(`azzurri ok`, function () {
          assert(JSON.stringify(adjData).indexOf(`azzurri`) > -1);
        });
        it(`bianca ok`, function () {
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

  describe('es_ES', function () {
    describe('getters', function () {
      const helper = new CodeGenHelper('es_ES', true);
      describe('getVerbCandidate', function () {
        it(`verb: 'hablar'`, function () {
          assert.equal(helper.getVerbCandidate("getAnonMS(), {verb: 'hablar', tense:'PRESENTE'}"), 'hablar');
        });
      });
    });

    describe('extractors', function () {
      const helper = new CodeGenHelper('es_ES', true);
      it(`extractWordCandidateFromValue represents`, function () {
        helper.extractWordCandidateFromValue("'alianza', {represents: SOMETHING}");
        assert(helper.getWordCandidates().indexOf('alianza') > -1);
      });
      describe('extractAdjectiveCandidateFromValue', function () {
        it(`simple adj`, function () {
          helper.extractWordCandidateFromValue("'pastel', {adj:'delicioso', adjPos:'BEFORE', number:'P'}");
          assert(helper.getWordCandidates().indexOf('pastel') > -1);
        });
        it(`adj BEFORE and AFTER`, function () {
          helper.extractAdjectiveCandidateFromValue(
            "'árbol', { det:'DEFINITE', number:'P', adj:{BEFORE:['grande'], AFTER:['blanco', 'beige']} }",
          );
          for (const adj of ['grande', 'blanco', 'beige']) {
            assert(helper.getAdjectiveCandidates().indexOf(adj) > -1);
          }
        });
      });
    });

    describe('get candidates data', function () {
      describe('getVerbCandidatesData', function () {
        const helper = new CodeGenHelper('es_ES', true);
        helper.verbCandidates = ['hablar', 'venir', 'XXXX'];
        const verbData = helper.getVerbCandidatesData();
        for (const verbInfo of ['vendría', 'vinieran', 'hablaban', 'habló']) {
          it(`shoud contain ${verbInfo}`, function () {
            assert(JSON.stringify(verbData).indexOf(verbInfo) > -1, JSON.stringify(verbData));
          });
        }
      });

      describe('getWordCandidatesData', function () {
        const helper = new CodeGenHelper('es_ES', true);
        helper.wordCandidates = ['rey', 'lápiz', 'blabla'];
        const wordData = helper.getWordCandidatesData();
        //console.log(JSON.stringify(wordData));
        for (const wordInfo of ['reyes', 'lápices']) {
          it(`shoud contain ${wordInfo}`, function () {
            assert(JSON.stringify(wordData).indexOf(wordInfo) > -1);
          });
        }
      });
      describe('getAdjectiveCandidatesData', function () {
        const helper = new CodeGenHelper('es_ES', true);
        helper.adjectiveCandidates = ['parlanchín', 'joven', 'español', 'blablabla'];
        const adjData = helper.getAdjectiveCandidatesData();
        //console.log(JSON.stringify(adjData));
        for (const adjInfo of ['parlanchina', 'jóvenes', 'joven', 'española', 'españolas']) {
          it(`shoud contain ${adjInfo}`, function () {
            assert(JSON.stringify(adjData).indexOf(adjInfo) > -1);
          });
        }
      });
    });
  });

  describe('fr_FR', function () {
    describe('getters', function () {
      const helper = new CodeGenHelper('fr_FR', true);
      describe('words, thirdPossession', function () {
        it(`second param only`, function () {
          assert.deepEqual(helper.getWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'"), ['pureté']);
        });
        it(`none`, function () {
          assert.deepEqual(helper.getWordCandidateFromThirdPossession('TOUS_PRODUITS, getSomeWord()'), []);
        });
        it(`2 ones: possessor + possessed`, function () {
          const words = helper.getWordCandidateFromThirdPossession("'pierre', 'beauté'");
          assert.equal(words.length, 2);
          assert(words.indexOf('pierre') > -1);
          assert(words.indexOf('beauté') > -1);
        });
      });
    });

    describe('extractors', function () {
      const helper = new CodeGenHelper('fr_FR', true);

      describe('verbs', function () {
        describe('verb/subjectVerb mixin', function () {
          it(`simple`, function () {
            helper.extractVerbCandidate('SOME_SUBJ, "manger"');
            assert(helper.getVerbCandidates().indexOf('manger') > -1);
          });
          it(`with tense`, function () {
            helper.extractVerbCandidate("SOME_SUBJ, {verb: 'voir', tense:PRESENT}");
            assert(helper.getVerbCandidates().indexOf('voir') > -1);
          });
          it(`multiple verbs, no struct`, function () {
            const cand = helper.getVerbCandidate("SOME_SUBJ, ['parler', 'discuter', getSomething()]");
            assert.equal(cand.length, 2);
            assert(cand.indexOf('parler') > -1);
            assert(cand.indexOf('discuter') > -1);
          });
          it(`multiple verbs in struct`, function () {
            const cand = helper.getVerbCandidate("SOME_SUBJ, {verb: ['voir', 'manger'], tense:PRESENT}");
            assert.equal(cand.length, 2);
            assert(cand.indexOf('voir') > -1);
            assert(cand.indexOf('manger') > -1);
          });
        });
        describe('subjectVerbAdj mixin', function () {
          it(`simple`, function () {
            helper.extractVerbCandidate("PRODUCT, 'sembler', 'luxueux'");
            assert(helper.getVerbCandidates().indexOf('sembler') > -1);
          });
          it(`complex verb`, function () {
            helper.extractVerbCandidate("getSomething(), {verb: 'paraître'}, 'intéressant'");
            assert(helper.getVerbCandidates().indexOf('paraître') > -1);
          });
        });
      });

      describe('words', function () {
        it(`third possession`, function () {
          helper.extractWordCandidateFromThirdPossession("TOUS_PRODUITS,'pureté'");
          assert(helper.getWordCandidates().indexOf('pureté') > -1);
        });

        it(`word from SubjectVerb`, function () {
          helper.extractWordCandidateFromVerbalForm("'lampe', {verb: 'paraître'}");
          assert(helper.getWordCandidates().indexOf('lampe') > -1);
        });

        it(`word from SubjectVerb`, function () {
          helper.extractWordCandidateFromVerbalForm("'lampe', 'sembler'");
          assert(helper.getWordCandidates().indexOf('lampe') > -1);
        });

        it(`word from SubjectVerbAdj`, function () {
          helper.extractWordCandidateFromVerbalForm(
            "'lampe', 'être', ['somptueux', 'beau', 'lumineux', getSomething()], {det:'DEFINITE'}",
          );
          assert(helper.getWordCandidates().indexOf('lampe') > -1);
        });

        it(`list of words from SubjectVerbAdj`, function () {
          const candidates = helper.getWordCandidateFromVerbalForm(
            "['lampe', 'génie'], 'être', ['somptueux', 'beau', 'lumineux', getSomething()], {det:'DEFINITE'}",
          );
          assert(candidates.indexOf('lampe') > -1);
          assert(candidates.indexOf('génie') > -1);
        });

        it(`list of nouns from value`, function () {
          const res = helper.getWordCandidateFromValue(
            "['alsacien', 'homme', 'maison', 'gourou'], {det:'DEFINITE', adj:'vieux', adjPos:'BEFORE', represents: TRUC}",
          );
          const expected = ['alsacien', 'homme', 'maison', 'gourou'];
          assert.equal(res.length, expected.length);
          for (let i = 0; i < expected.length; i++) {
            assert(res.indexOf(expected[i]) > -1);
          }
        });
      });
      describe('adjectives', function () {
        describe('value mixin', function () {
          it(`value with adj list`, function () {
            const candidates = helper.getAdjectiveCandidatesFromValue(
              "'homme', {det:'INDEFINITE', adj:['beau', 'grand'], adjPos:'BEFORE'}",
            );
            assert(candidates.length === 2);
            assert(candidates.indexOf('beau') > -1);
            assert(candidates.indexOf('grand') > -1);
          });

          it(`value with only before`, function () {
            const candidates = helper.getAdjectiveCandidatesFromValue(
              "'vache', {det:'INDEFINITE', adj:{ BEFORE: ['beau', 'intelligent', getOneMore()], XX:['smart'] } }",
            );
            assert(candidates.length === 2);
            assert(candidates.indexOf('beau') > -1);
            assert(candidates.indexOf('intelligent') > -1);
          });

          it(`value with before and after adj list`, function () {
            const candidates = helper.getAdjectiveCandidatesFromValue(
              "'vache', {det:'INDEFINITE', adj:{ BEFORE: ['beau', 'intelligent'], AFTER: ['brun'] } }",
            );
            assert(candidates.length === 3);
            assert(candidates.indexOf('beau') > -1);
            assert(candidates.indexOf('intelligent') > -1);
            assert(candidates.indexOf('brun') > -1);
          });

          it(`value with list as nouns`, function () {
            const candidates = helper.getAdjectiveCandidatesFromValue(
              "['alsacien', 'homme', 'maison', 'gourou'], {det:'DEFINITE', adj:'vieux', adjPos:'BEFORE', represents: TRUC}",
            );
            assert(candidates.length === 1);
            assert(candidates.indexOf('vieux') > -1);
          });
        });
        describe('agreeAdj mixin', function () {
          it(`simple`, function () {
            const candidates = helper.getAdjectiveCandidateFromAgreeAdj("'vieux', getAnonFP()");
            assert(candidates.length === 1);
            assert(candidates.indexOf('vieux') > -1);
          });
          it(`with list`, function () {
            const candidates = helper.getAdjectiveCandidateFromAgreeAdj(
              "['vieux', 'beau', 'intéressant'], getAnonFP()",
            );
            assert(candidates.length === 3);
            assert(candidates.indexOf('vieux') > -1);
            assert(candidates.indexOf('beau') > -1);
            assert(candidates.indexOf('intéressant') > -1);
          });
        });

        describe('subjectVerbAdj mixin', function () {
          it(`simple`, function () {
            const res = helper.getAdjCandidateFromSubjectVerbAdj("PRODUCT, 'sembler', 'luxueux'");
            assert(res.indexOf('luxueux') > -1);
          });
          it(`extract simple adj when complex verb`, function () {
            const res = helper.getAdjCandidateFromSubjectVerbAdj("PRODUCT, {verb: 'paraître'}, 'intéressant'");
            assert(res.indexOf('intéressant') > -1);
          });
          it(`list of adjectives`, function () {
            const localHelper = new CodeGenHelper('fr_FR', true);
            localHelper.extractAdjCandidateFromSubjectVerbAdj(
              "'lampe', 'être', ['somptueux', 'beau', 'lumineux', getSomething()], {det:'DEFINITE'}",
            );
            const res = localHelper.getAdjectiveCandidates();
            assert.equal(res.length, 3, res);
            assert(res.indexOf('somptueux') > -1);
            assert(res.indexOf('beau') > -1);
            assert(res.indexOf('lumineux') > -1);
          });
        });
      });
    });

    describe('get candidates data', function () {
      describe('getVerbCandidatesData', function () {
        const helper = new CodeGenHelper('fr_FR', true);
        helper.verbCandidates = ['manger', 'boire', 'blabla'];
        const verbData = helper.getVerbCandidatesData();
        it(`manger ok`, function () {
          assert(JSON.stringify(verbData).indexOf('mangera') > -1);
        });
        it(`buvait ok`, function () {
          assert(JSON.stringify(verbData).indexOf('buvait') > -1);
        });
      });

      describe('getWordCandidatesData', function () {
        const helper = new CodeGenHelper('fr_FR', true);
        helper.wordCandidates = ['perle', 'diamant', 'genou', 'xxxxx'];
        const wordData = helper.getWordCandidatesData();
        // console.log(JSON.stringify(wordData));
        it(`perle F ok`, function () {
          assert.equal(wordData['perle']['gender'], 'F');
        });
        it(`diamant M ok`, function () {
          assert.equal(wordData['diamant']['gender'], 'M');
        });
        it(`genoux ok`, function () {
          assert.equal(wordData['genou']['plural'], 'genoux');
        });
      });

      describe('getAdjectiveCandidatesData', function () {
        const helper = new CodeGenHelper('fr_FR', true);
        helper.adjectiveCandidates = ['grand', 'joyeux', 'beau'];
        const adjData = helper.getAdjectiveCandidatesData();
        //console.log(JSON.stringify(adjData));
        for (const adjInfo of ['grandes', 'joyeuses', 'joyeux', 'belles', 'bel']) {
          it(`shoud contain ${adjInfo}`, function () {
            assert(JSON.stringify(adjData).indexOf(adjInfo) > -1);
          });
        }
      });
    });

    describe('getAllLinguisticResources', function () {
      const helper = new CodeGenHelper('fr_FR', true);
      helper.verbCandidates = ['manger'];
      helper.wordCandidates = ['perle'];

      const all = helper.getAllLinguisticResources(null);
      ['mangera', `"perle":{"gender":"F"`].forEach(function (elt) {
        it(`${elt} ok`, function () {
          assert(JSON.stringify(all).indexOf(elt) > -1);
        });
      });
    });
  });

  describe('en_US', function () {
    describe('getters', function () {
      const helper = new CodeGenHelper('en_US', true);
      describe('getVerbCandidate', function () {
        it(`verb: 'swim with tense: form'`, function () {
          assert.equal(helper.getVerbCandidate("subjS, {verb: 'swim', tense: 'PROGRESSIVE_PRESENT'}"), 'swim');
        });
        it(`verb: 'swim', simpler form`, function () {
          assert.equal(helper.getVerbCandidate("subjS, 'swim'"), 'swim');
        });
        it(`verb: 'sleep' with GOING_TO`, function () {
          assert.equal(
            helper.getVerbCandidate("subjS, {verb: 'sleep', tense: 'SIMPLE_FUTURE', GOING_TO: true}"),
            'sleep',
          );
        });
      });

      describe('getWordCandidateFromValue', function () {
        it(`'tomato'`, function () {
          assert.equal(helper.getWordCandidateFromValue("'tomato', {represents: PRODUCT}"), 'tomato');
        });
        it(`no represents`, function () {
          assert.equal(helper.getWordCandidateFromValue("'tomato'"), 'tomato');
        });
      });
    });

    describe('get candidates data', function () {
      describe('getVerbCandidatesData', function () {
        const helper = new CodeGenHelper('en_US', true);
        helper.verbCandidates = ['swim', 'let', 'do'];
        const verbData = helper.getVerbCandidatesData();
        // console.log(JSON.stringify(verbData));
        it(`swim ok`, function () {
          assert(JSON.stringify(verbData).indexOf('swam') > -1);
          assert(JSON.stringify(verbData).indexOf('swum') > -1);
          assert(JSON.stringify(verbData).indexOf('swimming') > -1);
        });
        it(`let ok`, function () {
          assert(JSON.stringify(verbData).indexOf('letting') > -1);
        });
        it(`do ok`, function () {
          assert(JSON.stringify(verbData).indexOf('did') > -1);
        });
      });

      describe('getWordCandidatesData', function () {
        const helper = new CodeGenHelper('en_US', true);
        helper.wordCandidates = ['tooth', 'egg', 'tomato'];
        const wordData = helper.getWordCandidatesData();
        // console.log(wordData);
        it(`teeth ok`, function () {
          assert(JSON.stringify(wordData).indexOf('teeth') > -1);
        });
        it(`tomatoes ok`, function () {
          assert(JSON.stringify(wordData).indexOf('tomatoes') > -1);
        });
        it(`eggs ok`, function () {
          assert(JSON.stringify(wordData).indexOf('eggs') > -1);
        });
      });
    });

    describe('getAllLinguisticResources', function () {
      const helper = new CodeGenHelper('en_US', true);
      helper.verbCandidates = ['swim', 'eat', 'listen'];
      const all = helper.getAllLinguisticResources(null);
      ['ate', 'swimming'].forEach(function (elt) {
        it(`${elt} ok`, function () {
          assert(JSON.stringify(all).indexOf(elt) > -1);
        });
      });
      // regular verb
      assert.equal(JSON.stringify(all).indexOf('listen'), -1);
    });
  });

  describe('edge', function () {
    describe('unsupported language nl_NL', function () {
      describe('getters', function () {
        const helper = new CodeGenHelper('nl_NL', true);
        describe('getWordCandidateFromThirdPossession', function () {
          it(`'zuiverheid'`, function () {
            assert.equal(helper.getWordCandidateFromThirdPossession("BLA,'zuiverheid'"), undefined);
          });
        });
      });

      describe('get candidates data', function () {
        const helper = new CodeGenHelper('nl_NL', true);
        describe('getVerbCandidate', function () {
          it(`verb: 'swim with tense: form'`, function () {
            assert.equal(helper.getVerbCandidate("subjS, 'enten'"), null);
          });
        });

        describe('getVerbCandidatesData', function () {
          const helper = new CodeGenHelper('nl_NL', true);
          helper.verbCandidates = ['eten'];
          const verbData = helper.getVerbCandidatesData();
          it(`eten not ok`, function () {
            assert(JSON.stringify(verbData).indexOf('eten') === -1);
          });
        });

        describe('getWordCandidatesData', function () {
          const helper = new CodeGenHelper('nl_NL', true);
          helper.wordCandidates = ['parel'];
          const wordData = helper.getWordCandidatesData();
          //console.log(JSON.stringify(wordData));
          it(`parel not ok`, function () {
            assert(JSON.stringify(wordData).indexOf('parel') === -1);
          });
        });
      });

      describe('getAllLinguisticResources', function () {
        const helper = new CodeGenHelper('nl_NL', true);

        const all = helper.getAllLinguisticResources(null);
        it(`nothing`, function () {
          assert.equal(JSON.stringify(all), '{"verbs":{},"words":{},"adjectives":{}}');
        });
      });
    });
    describe('extract without the good language', function () {
      describe('using en_US', function () {
        const helper = new CodeGenHelper('en_US', true);
        it(`on getAdjectiveCandidateFromAgreeAdj`, function () {
          assert.equal(helper.getAdjectiveCandidateFromAgreeAdj('bla'), null);
        });
        it(`on getAdjectiveCandidatesFromValue`, function () {
          assert.equal(helper.getAdjectiveCandidatesFromValue('bla').length, 0);
        });
      });

      describe('using nl_NL', function () {
        const helper = new CodeGenHelper('nl_NL', true);
        it(`on getVerbCandidate`, function () {
          assert.equal(helper.getVerbCandidate('BLA, "look"'), null);
        });
        it(`on getWordCandidateFromSetRefGender`, function () {
          assert.equal(helper.getWordCandidateFromSetRefGender('bla'), null);
        });
        it(`on getWordCandidateFromThirdPossession`, function () {
          assert.equal(helper.getWordCandidateFromThirdPossession('bla'), null);
        });
        it(`on getWordCandidateFromValue`, function () {
          assert.equal(helper.getWordCandidateFromValue('bla'), null);
        });
        it(`on getAdjCandidateFromSubjectVerbAdj`, function () {
          assert.equal(helper.getAdjCandidateFromSubjectVerbAdj('bla'), null);
        });
        it(`word from SubjectVerb`, function () {
          const res = helper.getWordCandidateFromVerbalForm("'someWord', {verb: 'someVerb'}");
          assert(res == null, res);
        });
      });
    });
    describe('edge cases', function () {
      const helper = new CodeGenHelper('de_DE', true);
      it('getWordCandidateFromValue on a number', function () {
        assert.deepEqual(helper.getWordCandidateFromValue('20'), []);
      });
      it('getWordCandidateFromValue represents but no result', function () {
        assert.deepEqual(helper.getWordCandidateFromValue('XXX, {represents: PRODUKT}'), []);
      });
      it('words on thirdPossession represents but no result', function () {
        assert.deepEqual(helper.getWordCandidateFromThirdPossession('XXX, YYY'), []);
      });
      it(`words on thirdPossession but no second arg`, function () {
        assert.throws(() => helper.getWordCandidateFromThirdPossession('bla'), /while should have at least/);
      });
      it('getAdjectiveCandidatesFromValue but no adjective, on strong', function () {
        assert.equal(helper.getAdjectiveCandidatesFromValue('"bla"').length, 0);
      });
      it('getAdjectiveCandidatesFromValue but no adjective, on expr', function () {
        assert.equal(helper.getAdjectiveCandidatesFromValue('bla').length, 0);
      });
      it('getAdjectiveCandidatesFromValue invalid struct', function () {
        assert.equal(helper.getAdjectiveCandidatesFromValue("'Gurke', {adj:getToto()}").length, 0);
      });
      it(`getWordCandidateFromSetRefGender but no second arg`, function () {
        assert.throws(() => assert.equal(helper.getWordCandidateFromSetRefGender('bla'), /null/));
      });
      it(`getWordCandidateFromSetRefGender wrong second arg`, function () {
        assert.equal(helper.getWordCandidateFromSetRefGender('bla, getWord()'), null);
      });
      it(`getVerbCandidate but not enough arguments`, function () {
        assert.throws(() => helper.getVerbCandidate('XXX'), /should have at least/);
      });
      it(`getAdjectiveCandidateFromAgreeAdj but no arg at all`, function () {
        assert.throws(() => assert.equal(helper.getAdjectiveCandidateFromAgreeAdj(/*nothing*/), /null/));
      });
    });
  });
});
