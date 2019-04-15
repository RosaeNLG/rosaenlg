var assert = require('assert');
var GermanVerbs = require('../dist/index.js');

const testCasesConj = {
  'PRASENS': [
    [ 'sehen',    3, 'S', 'sieht' ],
    [ 'mögen',    3, 'S', 'mag'],
    [ 'fechten',  3, 'S', 'ficht' ],
    [ 'sein',     3, 'S', 'ist' ],
    [ 'haben',    3, 'S', 'hat' ],
    [ 'warten',   3, 'S', 'wartet' ],
    [ 'lesen',    3, 'S', 'liest' ],
  ],

  'PRATERITUM': [
    [ 'sehen',    3, 'S', 'sah'],
    [ 'sehen',    3, 'P', 'sahen'],
    [ 'fechten',  3, 'S', 'focht'],
    [ 'wollen',   3, 'S', 'wollte'],
    [ 'lernen',   3, 'S', 'lernte'],
    [ 'sein',     3, 'S', 'war'],
    [ 'sein',     3, 'P', 'waren'],
    [ 'haben',    3, 'S', 'hatte'],
    [ 'bringen',  3, 'S', 'brachte'],
    [ 'schreien', 3, 'P', 'schrien'],
  ],

  'FUTUR1': [
    [ 'aussehen', 3, 'S', 'wird aussehen'],
    [ 'sein',     3, 'S', 'wird sein'],
  ],

  'PERFEKT': [
    [ 'aufräumen', 3, 'S', 'HABEN', 'hat aufgeräumt'],
    [ 'kommen',    3, 'P', 'SEIN',  'sind gekommen'],
    [ 'kommen',    3, 'P', null,    'sind gekommen'],
    [ 'landen',    3, 'S', null,    'ist gelandet'],
  ],

  'PLUSQUAMPERFEKT': [
    [ 'aufräumen', 3, 'S', 'HABEN', 'hatte aufgeräumt'],
    [ 'kommen',    3, 'P', 'SEIN',  'waren gekommen'],
  ],

  'FUTUR2': [
    [ 'denken',     3, 'S', 'HABEN', 'wird gedacht haben'],
    [ 'aufwachen',  3, 'P', 'SEIN',  'werden aufgewacht sein'],
  ],

  'KONJUNKTIV1_PRASENS': [
    [ 'haben',  3, 'S', 'habe'],
    [ 'sein',   3, 'S', 'sei'],
    [ 'sein',   3, 'P', 'seien'],
    [ 'leben',  3, 'S', 'lebe'],
    [ 'kommen', 3, 'S', 'komme'],
    [ 'wissen', 3, 'S', 'wisse'],
  ],

  'KONJUNKTIV1_FUTUR1': [
    [ 'gehen',  3, 'S', 'werde gehen'],
    [ 'gehen',  3, 'P', 'werden gehen'],
    [ 'werden', 2, 'S', 'werdest werden'],
  ],

  'KONJUNKTIV1_PERFEKT': [
    [ 'gehen',     3, 'S', 'SEIN',   'sei gegangen'],
    [ 'gehen',     3, 'P', 'SEIN',   'seien gegangen'],
    [ 'werden',    3, 'P', 'SEIN',   'seien geworden'],
    [ 'aufräumen', 3, 'S', 'HABEN',  'habe aufgeräumt']
  ],

  'KONJUNKTIV2_PRATERITUM': [
    [ 'essen',  3, 'S', 'äße'],
    [ 'essen',  3, 'P', 'äßen'],
    [ 'kommen', 3, 'S', 'käme'],
    [ 'kommen', 3, 'P', 'kämen'],
  ],

  'KONJUNKTIV2_FUTUR1': [
    [ 'essen',  3, 'S', 'würde essen'],
    [ 'essen',  3, 'P', 'würden essen'],
    [ 'kommen', 3, 'S', 'würde kommen'],
    [ 'kommen', 3, 'P', 'würden kommen'],
  ],

  'KONJUNKTIV2_FUTUR2': [
    [ 'essen',  3, 'S', 'HABEN', 'werde gegessen haben'],
    [ 'essen',  3, 'P', 'HABEN', 'werden gegessen haben'],
    [ 'kommen', 3, 'S', 'SEIN',  'werde gekommen sein'],
    [ 'kommen', 3, 'P', 'SEIN',  'werden gekommen sein'],
  ],

};


const testCasesPartizip2 = [
  ['gehen', 'gegangen'],
  ['lesen', 'gelesen'],
  ['geschehen', 'geschehen'],
  ['lernen', 'gelernt'],
  ['haben', 'gehabt'],
  ['bringen', 'gebracht'],
  ['verstehen', 'verstanden'],
  ['ankommen', 'angekommen'],
  ['werden', 'geworden'],
  ['verzeihen', 'verziehen'],
];

const testCasesReflexiveCase = [
  [ 'treffen',  'ACC' ],
  [ 'ärgern',   'ACC' ],
  [ 'kaufen',   'DAT' ],
  [ 'waschen',   null ],
];

const testCasesReflexivePronouns = [
  ['ACC', 'S', 1, 'mich'],
  ['DAT', 'S', 1, 'mir'],
  ['DAT', 'P', 3, 'sich'],
  [null,  'S', 3, 'sich'],
];



describe('german-verbs', function() {
  describe('#getConjugation()', function() {

    describe('nominal', function() {

      Object.keys(testCasesConj).forEach(function (tense) {

        describe(tense, function() {

          const testCasesConjByTense = testCasesConj[tense];
          testCasesConjByTense.forEach(function(testCase) {

            const verb = testCase[0];
            const person = testCase[1];
            const number = testCase[2];
      
            let expected;
            let aux;
            const tensesWithAux = [ 'PERFEKT', 'PLUSQUAMPERFEKT', 'FUTUR2', 
                                    'KONJUNKTIV1_PERFEKT', 'KONJUNKTIV2_FUTUR2' ];
            if (tensesWithAux.indexOf(tense)>-1) {
              aux = testCase[3];
              expected = testCase[4];
            } else {
              expected = testCase[3];
            }
      
            it(`${verb} ${tense} ${person} ${number} => ${expected}`, function() {
              assert.equal(
                GermanVerbs.getConjugation(verb, tense, person, number, aux).join(' '),
                expected       
              )
            });
      
          });
        });
      });
    });

    describe('local verb list', function() {
      let fressen = JSON.parse(JSON.stringify( GermanVerbs.getVerbData('fressen') ));
      fressen['PRT']['S']['2'] = 'fraß tralalala';
      // console.log(fressen);
      it(`changed verb locally`, function() {
        assert.equal( GermanVerbs.getConjugation(
          'fressen', 'PRATERITUM', 2, 'S',
          null, null, null,
          { 'fressen': fressen }
        ), 'fraß tralalala' )
      });
    });

    describe('reflexive', function() {
      it(`Ich wasche mich`, function() {
        assert.equal(
          GermanVerbs.getConjugation('waschen', 'PRASENS', 1, 'S', null, true, 'ACC').join(' '),
          'wasche mich'       
        )
      });
      it(`Ich habe mir die Hände gewaschen`, function() {
        assert.equal(
          GermanVerbs.getConjugation('waschen', 'PERFEKT', 1, 'S', 'HABEN', true, 'DAT').join(' '),
          'habe mir gewaschen'       
        )
      });
    });
    
    describe('edge cases', function() {
      it(`no verb`, function() { assert.throws( () => GermanVerbs.getConjugation(null, 'PRASENS', 3, 'S', null), /verb/ ) });    
      it(`invalid verb`, function() { assert.throws( () => GermanVerbs.getConjugation('blabla', 'PRASENS', 3, 'S', null), /dict/ ) });
      it(`invalid tense`, function() { assert.throws( () => GermanVerbs.getConjugation('sehen', 'bla', 3, 'S', null), /tense/ ) });
      it(`invalid person`, function() { assert.throws( () => GermanVerbs.getConjugation('sehen', 'PRASENS', 4, 'S', null), /person/ ) });
      it(`invalid number`, function() { assert.throws( () => GermanVerbs.getConjugation('sehen', 'PRASENS', 3, 'X', null), /number/ ) });
      it(`no tense for verb`, function() { assert.throws( () => GermanVerbs.getConjugation('schreiten', 'PRATERITUM', 3, 'S', null), /dict/ ) });
      
      // ineinanderzufügen has no PRÄ for S
      it(`no number for verb`, function() { assert.throws( () => GermanVerbs.getConjugation('ineinanderzufügen', 'PRASENS', 3, 'S', null), /S/ ) });

      // platzieren has not person 2 for P PRÄ
      it(`no perso for verb`, function() { assert.throws( () => GermanVerbs.getConjugation('platzieren', 'PRASENS', 2, 'P', null), /2/ ) });

      it(`invalid aux`, function() { assert.throws( () => GermanVerbs.getConjugation('essen', 'PERFEKT', 3, 'S', 'blabla'), /aux/ ) });
      
    });

  });

  describe('#getPartizip2()', function() {

    describe('nominal', function() {

      testCasesPartizip2.forEach( function(testCaseP2) {

        const verb = testCaseP2[0];
        const expected = testCaseP2[1];

        it(`${verb} => ${expected}`, function() {
          assert.equal(
            GermanVerbs.getPartizip2(verb),
            expected       
          )
        });

      });

    });

    describe('edge cases', function() {
      // should have one but does not
      it(`no p2`, function() { assert.throws( () => GermanVerbs.getPartizip2('schleissen'), /found/ ) });
    });

  });


  describe('#getReflexiveCase()', function() {
    describe('nominal', function() {

      testCasesReflexiveCase.forEach( function(testCase) {
        const verb = testCase[0];
        const expectedCase = testCase[1];

        it(`${verb} => ${expectedCase}`, function() {
          assert.equal(
            GermanVerbs.getReflexiveCase(verb),
            expectedCase
          )
        });
      });

    });

  });

  describe('#getReflexiveFormPronoun()', function() {
    describe('nominal', function() {

      testCasesReflexivePronouns.forEach( function(testCase) {
        const germanCase = testCase[0];
        const number = testCase[1];
        const person = testCase[2];
        const expected = testCase[3];

        it(`${germanCase} ${number} ${person} => ${expected}`, function() {
          assert.equal(
            GermanVerbs.getReflexiveFormPronoun(germanCase, person, number),
            expected
          )
        });
      });

    });

    describe('edge', function() {
      it(`case required`, function() { assert.throws( () => GermanVerbs.getReflexiveFormPronoun(null, 1, 'S'), /pronominalCase/ ) });
    });


  });

  

});
