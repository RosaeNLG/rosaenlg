var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

const testCases = [
  // en_US
  {
    name: 'must provide a table with 2 elements',
    language: 'en_US',
    template: `p #{getSorP([], {bla:'bla'})}`,
    excepted: 'table'
  },
  {
    name: 'getFlagValue invalid params',
    language: 'en_US',
    template: `- getFlagValue({bla:'bla'}, null);`,
    excepted: 'flag'
  },
  {
    name: 'setRefGender obj should not be empty',
    language: 'en_US',
    template: `- setRefGender({}, 'blablabla');`,
    excepted: 'empty'
  },
  {
    name: 'setRefGenderNumber obj should not be empty',
    language: 'en_US',
    template: `- setRefGenderNumber({}, 'blablabla');`,
    excepted: 'empty'
  },
  {
    name: 'setRefGender called with null arg',
    language: 'en_US',
    template: `- setRefGender({any:'thing'}, null);`,
    excepted: 'invalid genderOrWord'
  },
  {
    name: 'setRefGender is not useful for English and no dict',
    language: 'en_US',
    template: `- setRefGender({any:'thing'}, 'blablabla');`,
    excepted: 'dict'
  },
  {
    name: 'value on wrong type',
    language: 'en_US',
    template: `l #[+value(true)]`,
    excepted: 'value not possible'
  },
  {
    name: 'recordSaid on null',
    language: 'en_US',
    template: `- recordSaid(null)`,
    excepted: 'null'
  },
  {
    name: 'deleteSaid on null',
    language: 'en_US',
    template: `- deleteSaid(null)`,
    excepted: 'null'
  },
  {
    name: '<> syntax not implemented',
    language: 'en_US',
    template: `l #[+value('<the blabla>')]`,
    excepted: 'not implemented'
  },
  {
    name: 'invalid begin with',
    language: 'en_US',
    template: `
l
  itemz {mode:'sentences', separator: '.', begin_with_general: {invalid:'invalid'} }
    item
      | bla
    item
      | bla

`,
    excepted: 'invalid'
  },
  {
    name: 'invalid assembly mode',
    language: 'en_US',
    template: `
l
  itemz {mode:'unknown_mode' }
    item
      | bla
    item
      | bla

`,
    excepted: 'mode'
  },
  {
    name: 'dot end with paragraphs mode',
    language: 'en_US',
    template: `
l
  itemz {mode:'paragraphs', end:'.' }
    item
      | bla
    item
      | bla
`,
    excepted: 'dot'
  },
  {
    name: 'no ref mixin',
    language: 'en_US',
    template: `
- var PRODUCT = {};
mixin PRODUCT_refexpr(obj, params)
  | REFEXPR
- PRODUCT.ref = null;
- PRODUCT.refexpr = 'PRODUCT_refexpr'
l #[+value(PRODUCT)] / #[+value(PRODUCT)]
`,
    excepted: 'ref'
  },
  {
    name: 'getNextRep called on null object',
    language: 'en_US',
    template: `- var next = getNextRep(null);`,
    excepted: 'null'
  },
  {
    name: 'null verb',
    language: 'en_US',
    template: `l #[+verb(getAnonymous('M', 'P'), {tense: 'PAST'})]`,
    excepted: 'verb'
  },
  {
    name: 'det is not supported',
    language: 'en_US',
    template: `l #[+value('tree', {det:'KRYPTOFINITE', adj:'green'})]`,
    excepted: 'determinant'
  },
  {
    name: 'invalid dist for demonstrative',
    language: 'en_US',
    template: `l #[+value('tree', {det:'DEMONSTRATIVE', dist:'NEARFARWHEREEVERYOUARE'})]`,
    excepted: 'dist'
  },
  {
    name: 'invalid possForm',
    language: 'en_US',
    template: `
-
  var RING = {};
  RING.ref = 'ring_ref';
mixin ring_ref(obj, params)
  | #[+value('ring', {det:'DEFINITE'})]
  - setRefGender(obj, 'N');

| #[+thirdPossession(RING, 'width', {possForm:'TOTO'})]
`,
    excepted: 'possForm'
  },




  // de_DE
  {
    name: 'invalid det',
    language: 'de_DE',
    template: `l #[+value('Gurke', {det:'BLABLAITE'})]`,
    excepted: 'not supported'
  },
  {
    name: 'not a supported German case for determinants',
    language: 'de_DE',
    template: `l #[+value('Gurke', {case:'INGENITIVE', det:'DEFINITE'})]`,
    excepted: 'case'
  },
  {
    name: 'gender is not in German dict',
    language: 'de_DE',
    template: `l #[+value('Gurkex', {det:'DEFINITE'})]`,
    excepted: 'German dict'
  },
  {
    name: 'empty table',
    language: 'de_DE',
    template: `l #{getMFN([], 'Frau')}`,
    excepted: 'table'
  },
  {
    name: 'feminine, must provide 2 elements',
    language: 'de_DE',
    template: `l #{getMFN(['A'], 'Frau')}`,
    excepted: 'table'
  },
  {
    name: 'neutral, must provide 3 elements',
    language: 'de_DE',
    template: `l #{getMFN(['A', 'B'], 'Mädchen')}`,
    excepted: 'table'
  },
  {
    name: 'getMFN no gender',
    language: 'de_DE',
    template: `l #{getMFN(['a','b','c'], {some:'thing'})}`,
    excepted: 'gender'
  },

  {
    name: 'owner has no clear gender',
    language: 'de_DE',
    template: `
mixin neu_produkt_ref(obj, params)
  | das Produkt
mixin neu_produkt_refexpr(obj, params)
  | es
-
  var NEU_PRODUKT = {neu:'produkt'};
  NEU_PRODUKT.ref = 'neu_produkt_ref';
  NEU_PRODUKT.refexpr = 'neu_produkt_refexpr';

l #[+thirdPossession(NEU_PRODUKT, 'Farbe', {case: 'NOMINATIVE'})]
l #[+thirdPossession(NEU_PRODUKT, 'Farbe', {case: 'NOMINATIVE'})]
`,
    excepted: 'gender'
  },

  {
    name: 'is not a supported German case for possessives',
    language: 'de_DE',
    template: `
mixin neu_produkt_ref(obj, params)
  | das Produkt
mixin neu_produkt_refexpr(obj, params)
  | es
-
  var NEU_PRODUKT = {neu:'produkt'};
  NEU_PRODUKT.ref = 'neu_produkt_ref';
  NEU_PRODUKT.refexpr = 'neu_produkt_refexpr';

l #[+thirdPossession(NEU_PRODUKT, 'Farbe', {case: 'NOMINATIVE'})]
l #[+thirdPossession(NEU_PRODUKT, 'Farbe', {case: 'BLABLATIVE'})]
`,
    excepted: 'case'
  },
  {
    name: 'not in dict with possessives',
    language: 'de_DE',
    template: `l #[+thirdPossession('Gurke', 'Mojo', {case:'GENITIVE'})]`,
    excepted: 'dict'
  },
  {
    name: 'is not in German dict',
    language: 'de_DE',
    template: `- setRefGender({any:'thing'}, 'blablabla_no_in_dict');`,
    excepted: 'dict'
  },
  {
    name: 'value / not in German dict',
    language: 'de_DE',
    template: `l #[+value('OnePlus 5T', {represents: {bla:'bla'}, gender:'N', det: 'DEMONSTRATIVE', case: 'GENITIVE'})]`,
    excepted: 'dict'
  },
  {
    name: 'setRefGender / not in German dict',
    language: 'de_DE',
    template: `- setRefGender({bla:'bla'}, 'Gurkex')`,
    excepted: 'dict'
  },
  {
    name: 'recipientPossession not implemented',
    language: 'de_DE',
    template: `l #[+recipientPossession({bla:'bla'})]`,
    excepted: 'not implemented'
  },





  // fr_FR
  {
    name: 'invalid adjective position',
    language: 'fr_FR',
    template: `l #[+value('arbre', {adj:'vert', adjPos:'AFTERRRR'})]`,
    excepted: 'adjective position'
  },
  {
    name: 'det is not supported',
    language: 'fr_FR',
    template: `l #[+value('arbre', {det:'KRYPTOFINITE', adj:'vert'})]`,
    excepted: 'determinant'
  },
  {
    name: 'its gender is not in French dict',
    language: 'fr_FR',
    template: `l #[+value('arbrex', {det:'DEFINITE'})]`,
    excepted: 'dict'
  },
  {
    name: 'not in French dict',
    language: 'fr_FR',
    template: `l #[+value('<la bon daifukumochi>')]`,
    excepted: 'dict'
  },
  {
    name: 'parse error',
    language: 'fr_FR',
    template: `l #[+value('<blablablabla>')]`,
    excepted: 'parse'
  },

  {
    name: 'number S or P',
    language: 'fr_FR',
    template: `- setRefNumber({bla:'bla'}, null);`,
    excepted: 'must be'
  },
  {
    name: 'null obj',
    language: 'fr_FR',
    template: `- setRefNumber(null, 'P');`,
    excepted: 'empty'
  },
  {
    name: 'no feminine substantive in French',
    language: 'fr_FR',
    template: `
-
  var MA_DOCTORESSE = {ma:'doctoresse'};
  setRefGender(MA_DOCTORESSE, 'F');
l #[+substantive('docteur', MA_DOCTORESSE)]    
    `,
    excepted: 'feminine substantive'
  },
  {
    name: 'is not in French dict',
    language: 'fr_FR',
    template: `- setRefGender({any:'thing'}, 'blablabla_no_in_dict')`,
    excepted: 'dict'
  },
  {
    name: 'invalid French gender',
    language: 'fr_FR',
    template: `- setRefGender({any:'thing'}, 'N');`,
    excepted: 'gender'
  },
    

];



describe('freenlg', function() {
  describe('exceptions', function() {

    for (var i=0; i<testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase.language} ${testCase.name}`, function() {
        assert.throws(() => freenlgPug.render(testCase.template, {language:testCase.language}), new RegExp(testCase.excepted))
      });
    }

  });
});

