const assert = require('assert');

const { DictManager, Constants, getIso2fromLocale, buildLanguageCommon } = require('../dist/index.js');

describe('rosaenlg-commons', function () {
  describe('LanguageCommon', function () {
    it('en', function () {
      const languageCommon = buildLanguageCommon('en');
      assert(languageCommon.validPropsAdj.indexOf('aan') > -1);
    });
    it('fr', function () {
      const languageCommon = buildLanguageCommon('fr');
      assert(languageCommon.validPropsWord.indexOf('contracts') > -1);
    });
    it('de', function () {
      const languageCommon = buildLanguageCommon('de');
      assert(languageCommon.validPropsWord.indexOf('AKK') > -1);
    });
    it('es', function () {
      const languageCommon = buildLanguageCommon('es');
      assert(languageCommon.allPunctList.indexOf('¿') > -1);
    });
    it('other', function () {
      const languageCommon = buildLanguageCommon('nl');
      assert.strictEqual(languageCommon.iso2, 'nl');
    });
    describe('it', function () {
      const languageCommon = buildLanguageCommon('it');
      it('startsWithVowel', function () {
        assert(!languageCommon.startsWithVowel('pneumatico'));
        assert(languageCommon.startsWithVowel('appartamento'));
      });

      it('isIFollowedByVowel', function () {
        assert(languageCommon.isIFollowedByVowel('yogurt'));
        assert(!languageCommon.isIFollowedByVowel('appartamento'));
        assert(!languageCommon.isIFollowedByVowel('parco'));
      });

      it('isConsonneImpure', function () {
        assert(languageCommon.isConsonneImpure('Pneumatico'));
        assert(languageCommon.isConsonneImpure('specchio'));
        assert(!languageCommon.isConsonneImpure('tramonto'));
      });
    });
  });
  describe('Constants', function () {
    const constants = new Constants();
    describe('voyelles lowercase', function () {
      const toCheckList = 'aoëÿø';
      for (let i = 0; i < toCheckList.length; i++) {
        const toCheck = toCheckList.charAt(i);
        it(`should contain ${toCheck}`, function () {
          assert(constants.toutesVoyellesMinuscules.includes(toCheck));
        });
      }
      it(`should not contain ç`, function () {
        assert(!constants.toutesVoyellesMinuscules.includes('ç'));
      });
    });

    describe('stdPunctList', function () {
      it('should contain std punctuation', function () {
        assert(Constants.stdPunctList.indexOf(';') > -1);
        assert(Constants.stdPunctList.indexOf('…') > -1);
      });
    });

    describe('toutesVoyellesMajuscules', function () {
      it('should work', function () {
        assert(constants.toutesVoyellesMajuscules.indexOf('A') > -1);
        assert(constants.toutesVoyellesMajuscules.indexOf('Y') > -1);
        assert(constants.toutesVoyellesMajuscules.indexOf('Ó') > -1);
      });
    });

    describe('toutesVoyellesMinMaj', function () {
      it('should work', function () {
        assert(constants.toutesVoyellesMinMaj.indexOf('a') > -1);
        assert(constants.toutesVoyellesMinMaj.indexOf('ô') > -1);
        assert(constants.toutesVoyellesMinMaj.indexOf('Ó') > -1);
      });
    });

    describe('getInBetween', function () {
      it('before protect', function () {
        assert(constants.getInBetween(true).includes('¤'), constants.getInBetween(true));
      });
      it('not before protect', function () {
        assert(constants.getInBetween(false).length == 0, constants.getInBetween(false));
      });
    });
  });

  describe('DictManager', function () {
    const lcfr = buildLanguageCommon('fr');

    describe('getWordData', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      dmfr.setWordData('ordi', { gender: 'M' });
      dmfr.setWordData('gow', { gender: 'F', plural: 'gowz' });
      const wordData = dmfr.getWordData();
      assert.strictEqual(wordData['ordi']['gender'], 'M');
      assert.strictEqual(wordData['gow']['plural'], 'gowz');
    });

    describe('getAdjsData', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      dmfr.setAdjData('zinda', { contracts: false, FP: 'zindas' });
      const adjData = dmfr.getAdjsData();
      assert.strictEqual(adjData['zinda']['contracts'], false);
      assert.strictEqual(adjData['zinda']['FP'], 'zindas');
    });

    describe('setEmbeddedWords', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      dmfr.setEmbeddedWords({ ordi: { gender: 'M' }, chum: { plural: 'chumz' } });
      dmfr.setWordData('gow', { gender: 'F', plural: 'gowz' });
      const wordsData = dmfr.getWordData();
      assert.strictEqual(wordsData['chum']['plural'], 'chumz');
      assert.strictEqual(wordsData['gow']['plural'], 'gowz');
    });

    describe('setEmbeddedAdj', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      dmfr.setEmbeddedAdj({ curieux: { MP: 'curieuxes' } });
      dmfr.setAdjData('zinda', { contracts: false, FP: 'zindas' });
      const adjsData = dmfr.getAdjsData();
      assert.strictEqual(adjsData['curieux']['MP'], 'curieuxes');
      assert.strictEqual(adjsData['zinda']['FP'], 'zindas');
    });

    describe('getAdjsWordsData', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      dmfr.setEmbeddedWords({ ordi: { gender: 'M' }, chum: { plural: 'chumz' } });
      dmfr.setAdjData('zinda', { contracts: false, FP: 'zindas' });
      const adjsWordsData = dmfr.getAdjsWordsData();
      assert.strictEqual(adjsWordsData['chum']['plural'], 'chumz');
      assert.strictEqual(adjsWordsData['zinda']['FP'], 'zindas');
    });

    describe('invalid prop', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      assert.throws(() => {
        dmfr.setWordData('bla', { bla: 'bla' });
      }, /invalid property/);
    });

    describe('complete word', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      dmfr.setWordData('gow', { gender: 'F' });
      dmfr.setWordData('gow', { plural: 'gowz' });
      const wordsData = dmfr.getWordData();
      assert.strictEqual(wordsData['gow']['plural'], 'gowz');
      assert.strictEqual(wordsData['gow']['gender'], 'F');
    });

    describe('complete adj', function () {
      const dmfr = new DictManager('fr', lcfr.validPropsWord, lcfr.validPropsAdj);
      dmfr.setAdjData('zinda', { contracts: false });
      dmfr.setAdjData('zinda', { FP: 'zindas' });
      const adjsData = dmfr.getAdjsData();
      assert.strictEqual(adjsData['zinda']['FP'], 'zindas');
      assert.strictEqual(adjsData['zinda']['contracts'], false);
    });
  });

  describe('misc', function () {
    it('nominal', function () {
      assert.strictEqual(getIso2fromLocale('en_US'), 'en');
    });
    it('invalid locale', function () {
      assert.throws(() => getIso2fromLocale('x'), /valid locale/);
    });
  });
  describe('edge', function () {
    it('no setIso2', function () {
      const languageCommon = buildLanguageCommon('fr');
      assert.throws(() => languageCommon.setIso2('xx'), /cannot set iso2/);
    });
  });
});
