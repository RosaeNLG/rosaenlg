var assert = require('assert');
var ItalianVerbs = require('../dist/index.js');

const testCasesConj = {
  PRESENTE: [
    ['mangiare', 1, 'S', 'mangio'],
    ['mangiare', 2, 'S', 'mangi'],
    ['mangiare', 3, 'S', 'mangia'],
    ['mangiare', 1, 'P', 'mangiamo'],
    ['mangiare', 2, 'P', 'mangiate'],
    ['mangiare', 3, 'P', 'mangiano'],
    ['essere', 3, 'S', 'è'],
  ],
  IMPERFETTO: [
    ['mangiare', 1, 'S', 'mangiavo'],
    ['mangiare', 2, 'S', 'mangiavi'],
    ['mangiare', 3, 'S', 'mangiava'],
    ['mangiare', 1, 'P', 'mangiavamo'],
    ['mangiare', 2, 'P', 'mangiavate'],
    ['mangiare', 3, 'P', 'mangiavano'],
  ],
  PASSATO_REMOTO: [
    ['mangiare', 1, 'S', 'mangiai'],
    ['mangiare', 2, 'S', 'mangiasti'],
    ['mangiare', 3, 'S', 'mangiò'],
    ['mangiare', 1, 'P', 'mangiammo'],
    ['mangiare', 2, 'P', 'mangiaste'],
    ['mangiare', 3, 'P', 'mangiarono'],
  ],
  FUTURO_SEMPLICE: [
    ['mangiare', 1, 'S', 'mangerò'],
    ['mangiare', 2, 'S', 'mangerai'],
    ['mangiare', 3, 'S', 'mangerà'],
    ['mangiare', 1, 'P', 'mangeremo'],
    ['mangiare', 2, 'P', 'mangerete'],
    ['mangiare', 3, 'P', 'mangeranno'],
  ],
  PASSATO_PROSSIMO: [
    ['mangiare', 1, 'S', 'AVERE', 'ho mangiato'],
    ['mangiare', 2, 'S', 'AVERE', 'hai mangiato'],
    ['mangiare', 3, 'S', 'AVERE', 'ha mangiato'],
    ['mangiare', 1, 'P', 'AVERE', 'abbiamo mangiato'],
    ['mangiare', 2, 'P', 'AVERE', 'avete mangiato'],
    ['mangiare', 3, 'P', 'AVERE', 'hanno mangiato'],
    // agreements
    ['venire', 3, 'S', 'ESSERE', 'è venuto', 'M', 'S'],
    ['venire', 3, 'P', 'ESSERE', 'sono venuti', null, 'P'],
    ['venire', 3, 'S', 'ESSERE', 'è venuta', 'F', 'S'],
    ['venire', 3, 'P', 'ESSERE', 'sono venute', 'F', 'P'],
  ],
  TRAPASSATO_PROSSIMO: [
    ['mangiare', 1, 'S', 'AVERE', 'avevo mangiato'],
    ['mangiare', 2, 'S', 'AVERE', 'avevi mangiato'],
    ['mangiare', 3, 'S', 'AVERE', 'aveva mangiato'],
    ['mangiare', 1, 'P', 'AVERE', 'avevamo mangiato'],
    ['mangiare', 2, 'P', 'AVERE', 'avevate mangiato'],
    ['mangiare', 3, 'P', 'AVERE', 'avevano mangiato'],
  ],
  TRAPASSATO_REMOTO: [
    ['mangiare', 1, 'S', 'AVERE', 'ebbi mangiato'],
    ['mangiare', 2, 'S', 'AVERE', 'avesti mangiato'],
    ['mangiare', 3, 'S', 'AVERE', 'ebbe mangiato'],
    ['mangiare', 1, 'P', 'AVERE', 'avemmo mangiato'],
    ['mangiare', 2, 'P', 'AVERE', 'aveste mangiato'],
    ['mangiare', 3, 'P', 'AVERE', 'ebbero mangiato'],
  ],
  FUTURO_ANTERIORE: [
    ['mangiare', 1, 'S', 'AVERE', 'avrò mangiato'],
    ['mangiare', 2, 'S', 'AVERE', 'avrai mangiato'],
    ['mangiare', 3, 'S', 'AVERE', 'avrà mangiato'],
    ['mangiare', 1, 'P', 'AVERE', 'avremo mangiato'],
    ['mangiare', 2, 'P', 'AVERE', 'avrete mangiato'],
    ['mangiare', 3, 'P', 'AVERE', 'avranno mangiato'],
  ],
  CONG_PRESENTE: [
    ['mangiare', 1, 'S', 'mangi'],
    ['mangiare', 2, 'S', 'mangi'],
    ['mangiare', 3, 'S', 'mangi'],
    ['mangiare', 1, 'P', 'mangiamo'],
    ['mangiare', 2, 'P', 'mangiate'],
    ['mangiare', 3, 'P', 'mangino'],
  ],
  CONG_PASSATO: [
    ['mangiare', 1, 'S', 'AVERE', 'abbia mangiato'],
    ['mangiare', 2, 'S', 'AVERE', 'abbia mangiato'],
    ['mangiare', 3, 'S', 'AVERE', 'abbia mangiato'],
    ['mangiare', 1, 'P', 'AVERE', 'abbiamo mangiato'],
    ['mangiare', 2, 'P', 'AVERE', 'abbiate mangiato'],
    ['mangiare', 3, 'P', 'AVERE', 'abbiano mangiato'],
  ],
  CONG_IMPERFETTO: [
    ['mangiare', 1, 'S', 'mangiassi'],
    ['mangiare', 2, 'S', 'mangiassi'],
    ['mangiare', 3, 'S', 'mangiasse'],
    ['mangiare', 1, 'P', 'mangiassimo'],
    ['mangiare', 2, 'P', 'mangiaste'],
    ['mangiare', 3, 'P', 'mangiassero'],
  ],
  CONG_TRAPASSATO: [
    ['mangiare', 1, 'S', 'AVERE', 'avessi mangiato'],
    ['mangiare', 2, 'S', 'AVERE', 'avessi mangiato'],
    ['mangiare', 3, 'S', 'AVERE', 'avesse mangiato'],
    ['mangiare', 1, 'P', 'AVERE', 'avessimo mangiato'],
    ['mangiare', 2, 'P', 'AVERE', 'aveste mangiato'],
    ['mangiare', 3, 'P', 'AVERE', 'avessero mangiato'],
  ],
  COND_PRESENTE: [
    ['mangiare', 1, 'S', 'mangerei'],
    ['mangiare', 2, 'S', 'mangeresti'],
    ['mangiare', 3, 'S', 'mangerebbe'],
    ['mangiare', 1, 'P', 'mangeremmo'],
    ['mangiare', 2, 'P', 'mangereste'],
    ['mangiare', 3, 'P', 'mangerebbero'],
  ],
  COND_PASSATO: [
    ['mangiare', 1, 'S', 'AVERE', 'avrei mangiato'],
    ['mangiare', 2, 'S', 'AVERE', 'avresti mangiato'],
    ['mangiare', 3, 'S', 'AVERE', 'avrebbe mangiato'],
    ['mangiare', 1, 'P', 'AVERE', 'avremmo mangiato'],
    ['mangiare', 2, 'P', 'AVERE', 'avreste mangiato'],
    ['mangiare', 3, 'P', 'AVERE', 'avrebbero mangiato'],
  ],
  IMPERATIVO: [['mangiare', 2, 'S', 'mangia'], ['mangiare', 1, 'P', 'mangiamo'], ['mangiare', 2, 'P', 'mangiate']],
};

describe('italian-verbs', function() {
  describe('#getConjugation()', function() {
    describe('nominal', function() {
      Object.keys(testCasesConj).forEach(function(tense) {
        describe(tense, function() {
          const testCasesConjByTense = testCasesConj[tense];
          testCasesConjByTense.forEach(function(testCase) {
            const verb = testCase[0];
            const person = testCase[1];
            const number = testCase[2];

            let expected;
            let aux;
            const tensesWithAux = [
              'PASSATO_PROSSIMO',
              'TRAPASSATO_PROSSIMO',
              'TRAPASSATO_REMOTO',
              'FUTURO_ANTERIORE',
              'CONG_PASSATO',
              'CONG_TRAPASSATO',
              'COND_PASSATO',
            ];
            if (tensesWithAux.indexOf(tense) > -1) {
              aux = testCase[3];
              expected = testCase[4];
            } else {
              expected = testCase[3];
            }

            let agreeGender = null;
            let agreeNumber = null;
            // agreements
            if (testCase.length === 7) {
              agreeGender = testCase[5];
              agreeNumber = testCase[6];
            }

            it(`${verb} ${tense} ${person} ${number} => ${expected}`, function() {
              assert.equal(
                ItalianVerbs.getConjugation(verb, tense, person, number, aux, agreeGender, agreeNumber),
                expected,
              );
            });
          });
        });
      });
    });
  });

  describe('local verb list', function() {
    let mangiare = JSON.parse(JSON.stringify(ItalianVerbs.getVerbInfo('mangiare')));
    mangiare['ind']['pres']['S2'] = 'tralalala';
    // console.log();
    it(`changed verb locally`, function() {
      assert.equal(
        ItalianVerbs.getConjugation('mangiare', 'PRESENTE', 2, 'S', null, null, null, { mangiare: mangiare }),
        'tralalala',
      );
    });
  });

  describe('edge cases', function() {
    it(`invalid number`, function() {
      assert.throws(() => ItalianVerbs.getConjugation('mangiare', 'PRESENTE', 3, 'X', null, null, null), /number/);
    });
    it(`invalid person`, function() {
      assert.throws(() => ItalianVerbs.getConjugation('mangiare', 'PRESENTE', 10, 'S', null, null, null), /person/);
    });
    it(`invalid tense`, function() {
      assert.throws(() => ItalianVerbs.getConjugation('mangiare', 'INVALID_TENSE', 3, 'S', null, null, null), /tense/);
    });
    it(`invalid aux`, function() {
      assert.throws(
        () => ItalianVerbs.getConjugation('mangiare', 'PASSATO_PROSSIMO', 3, 'S', 'FAKEAUX', null, null),
        /aux/,
      );
    });
    it(`IMPERATIVO invalid person`, function() {
      assert.throws(
        () => ItalianVerbs.getConjugation('mangiare', 'IMPERATIVO', 1, 'S', null, null, null),
        /IMPERATIVO/,
      );
    });
    it(`invalid agreeGender`, function() {
      assert.throws(
        () => ItalianVerbs.getConjugation('mangiare', 'PASSATO_PROSSIMO', 3, 'S', 'AVERE', 'X', null),
        /agreeGender/,
      );
    });
    it(`invalid agreeNumber`, function() {
      assert.throws(
        () => ItalianVerbs.getConjugation('mangiare', 'PASSATO_PROSSIMO', 3, 'S', 'AVERE', null, 'X'),
        /agreeNumber/,
      );
    });
    it(`no past participle`, function() {
      // no PF for pp cerchiare in morph-it
      assert.throws(
        () => ItalianVerbs.getConjugation('cerchiare', 'PASSATO_PROSSIMO', 3, 'S', 'AVERE', 'F', 'P'),
        /past participle/,
      );
    });
    it(`not found for person tense number`, function() {
      // no impr mode for accorgere
      assert.throws(
        () => ItalianVerbs.getConjugation('accorgere', 'IMPERATIVO', 2, 'S', null, null, null),
        /Italian dict but not/,
      );
    });
    it(`verb not in dict`, function() {
      // no impr mode for accorgere
      assert.throws(
        () => ItalianVerbs.getConjugation('mangiareXX', 'PRESENTE', 3, 'S', null, null, null),
        /not in Italian dict/,
      );
    });
    it(`null verb`, function() {
      // no impr mode for accorgere
      assert.throws(() => ItalianVerbs.getConjugation(null, 'PRESENTE', 3, 'S', null, null, null), /null/);
    });
  });
});
