var assert = require('assert');
var FrenchVerbs = require('../dist/index.js');

const testCasesConjugation = [
  [ "est allée", { verb: 'aller', person: 2, gender: 'F', aux: 'ETRE', tense: 'PASSE_COMPOSE', agreeGender:'F' } ],
  [ "finit", { verb: 'finir', person: 2, gender: 'M', tense: 'PRESENT' } ],
  [ "est", { verb: 'être', person: 2, gender: 'M', tense: 'PRESENT' } ],
  [ "sont", { verb: 'être', person: 5, gender: 'M', tense: 'PRESENT' } ],
  [ "oignent", { verb: 'oindre', person: 5, gender: 'M', tense: 'PRESENT' } ],
  [ "chantent", { verb: 'chanter', person: 5, gender: 'M', tense: 'PRESENT' } ],
  [ "vais", { verb: 'aller', person: 0, tense: 'PRESENT' } ],
  [ "vas", { verb: 'aller', person: 1, tense: 'PRESENT' } ],
  [ "boira", {verb: 'boire', person:2, tense:'FUTUR'}],
  [ "prendront", {verb: 'prendre', person:5, tense:'FUTUR'}],
  [ "firent", {verb: 'faire', person:5, tense:'PASSE_SIMPLE'}],
  [ "a bu", {verb: 'boire', person:2, tense:'PASSE_COMPOSE', aux:'AVOIR' }],
  [ "ont été", {verb: 'être', person:5, tense:'PASSE_COMPOSE', aux:'AVOIR' }],
  [ "ont mangé", {verb: 'manger', person:5, tense:'PASSE_COMPOSE', aux:'AVOIR'}],
  [ "est allé", {verb: 'aller', person:2, tense:'PASSE_COMPOSE', aux:'ETRE' }],
  [ "avaient sorti", {verb: 'sortir', person:5, tense:'PLUS_QUE_PARFAIT', aux:'AVOIR' }],
  [ "étaient parties", {verb: 'partir', person:5, tense:'PLUS_QUE_PARFAIT', aux:'ETRE', agreeGender:'F', agreeNumber:'P' }],
  [ "sont montés", {verb: 'monter', person:5, tense:'PASSE_COMPOSE', aux:'ETRE', agreeGender:'M', agreeNumber:'P'}],
  [ "suis monté", {verb: 'monter', person:0, tense:'PASSE_COMPOSE', aux:'ETRE', agreeGender:'M', agreeNumber:'S'}],
  [ "écrivez", {verb: 'écrire', person:4, tense:'PRESENT'}],
  [ "se concentre", {verb: 'concentrer', person:2, tense:'PRESENT', pronominal:true}],
  [ "me concentre", {verb: 'concentrer', person:0, tense:'PRESENT', pronominal:true}],
  [ "nous concentrons", {verb: 'concentrer', person:3, tense:'PRESENT', pronominal:true}],

  // auxiliaire automatique
  [ "s'est marrée", { verb: 'marrer', person: 2, gender: 'F', tense: 'PASSE_COMPOSE', agreeGender:'F', pronominal:true } ],
  [ "est arrivé", { verb: 'arriver', person: 2, gender: 'M', tense: 'PASSE_COMPOSE' } ],
  [ "a mangé", { verb: 'manger', person: 2, gender: 'M', tense: 'PASSE_COMPOSE' } ],

  // contraction / pronominal
  [ "s'arrête", {verb: 'arrêter', person:2, tense:'PRESENT', pronominal:true}],
  [ "m'arrête", {verb: 'arrêter', person:0, tense:'PRESENT', pronominal:true}],
  [ "se gausse", {verb: 'gausser', person:2, tense:'PRESENT', pronominal:true}],
  [ "s'écrie", {verb: 'écrier', person:2, tense:'PRESENT', pronominal:true}],
  [ "s'hydrate", {verb: 'hydrater', person:2, tense:'PRESENT', pronominal:true}],
  [ "se hait", {verb: 'haïr', person:2, tense:'PRESENT', pronominal:true}],
  [ "se haïssent", {verb: 'haïr', person:5, tense:'PRESENT', pronominal:true}],
  [ "s'est haï", {verb: 'haïr', person:2, tense:'PASSE_COMPOSE', aux:'ETRE', pronominal:true}],

];


describe('french-verbs', function() {
  describe('#getConjugation()', function() {
    for (var i=0; i<testCasesConjugation.length; i++) {
      const testCase = testCasesConjugation[i];
      it(`${testCase[0]}`, function() {
        assert.equal( FrenchVerbs.getConjugation(testCase[1]), testCase[0])
      });
    }
  });
});
