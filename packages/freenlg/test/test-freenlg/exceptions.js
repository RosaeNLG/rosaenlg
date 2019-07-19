var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

const testCasesPerLang = {
  en_US: [
    {
      name: 'must provide a table with 2 elements',
      template: `p #{getSorP([], {bla:'bla'})}`,
      excepted: 'table',
    },
    {
      name: 'getFlagValue invalid params',
      template: `- getFlagValue({bla:'bla'}, null);`,
      excepted: 'flag',
    },
    {
      name: 'setRefGender obj should not be empty',
      template: `- setRefGender({}, 'blablabla');`,
      excepted: 'empty',
    },
    {
      name: 'setRefGenderNumber obj should not be empty',
      template: `- setRefGenderNumber({}, 'blablabla');`,
      excepted: 'empty',
    },
    {
      name: 'setRefGender called with null arg',
      template: `- setRefGender({any:'thing'}, null);`,
      excepted: 'invalid genderOrWord',
    },
    {
      name: 'setRefGender is not useful for English and no dict',
      template: `- setRefGender({any:'thing'}, 'blablabla');`,
      excepted: 'dict',
    },
    {
      name: 'value on wrong type',
      template: `l #[+value(true)]`,
      excepted: 'value not possible',
    },
    {
      name: 'recordSaid on null',
      template: `- recordSaid(null)`,
      excepted: 'null',
    },
    {
      name: 'deleteSaid on null',
      template: `- deleteSaid(null)`,
      excepted: 'null',
    },
    {
      name: 'invalid begin with',
      template: `
l
  itemz {mode:'sentences', separator: '.', begin_with_general: {invalid:'invalid'} }
    item
      | bla
    item
      | bla
  `,
      excepted: 'invalid',
    },
    {
      name: 'invalid assembly mode',
      template: `
l
  itemz {mode:'unknown_mode' }
    item
      | bla
    item
      | bla
  `,
      excepted: 'mode',
    },
    {
      name: 'dot end with paragraphs mode',
      template: `
l
  itemz {mode:'paragraphs', end:'.' }
    item
      | bla
    item
      | bla
  `,
      excepted: 'dot',
    },
    {
      name: 'no ref mixin',
      template: `
- var PRODUCT = {};
mixin PRODUCT_refexpr(obj, params)
  | REFEXPR
- PRODUCT.ref = null;
- PRODUCT.refexpr = 'PRODUCT_refexpr'
l #[+value(PRODUCT)] / #[+value(PRODUCT)]
  `,
      excepted: 'ref',
    },
    {
      name: 'getNextRep called on null object',
      template: `- var next = getNextRep(null);`,
      excepted: 'null',
    },
    {
      name: 'null verb',
      template: `l #[+verb(getAnonymous('M', 'P'), {tense: 'PAST'})]`,
      excepted: 'verb',
    },
    {
      name: 'det is not supported',
      template: `l #[+value('tree', {det:'KRYPTOFINITE', adj:'green'})]`,
      excepted: 'determiner',
    },
    {
      name: 'invalid dist for demonstrative',
      template: `l #[+value('tree', {det:'DEMONSTRATIVE', dist:'NEARFARWHEREEVERYOUARE'})]`,
      excepted: 'dist',
    },
    {
      name: 'invalid possForm',
      template: `
-
  var RING = {};
  RING.ref = 'ring_ref';
mixin ring_ref(obj, params)
  | #[+value('ring', {det:'DEFINITE'})]
  - setRefGender(obj, 'N');
l #[+thirdPossession(RING, 'width', {possForm:'TOTO'})]
  `,
      excepted: 'possForm must be either OF or S',
    },
    {
      name: 'invertSubjectVerb',
      template: `l #[+subjectVerb({'bla':'bla'}, {verb:'eat'}, {'invertSubjectVerb':true})]`,
      excepted: 'invertSubjectVerb',
    },
    {
      name: 'possessiveAdj only in it_IT',
      template: `l #[+value('gioiello', {det: 'DEFINITE', possessiveAdj:'mio'})]`,
      excepted: 'possessiveAdj',
    },
    {
      name: 'invalid adj structure',
      template: `l #[+value('cow', { det:'INDEFINITE', adj: 1})]`,
      excepted: 'invalid structure',
    },
  ],
  de_DE: [
  {
    name: 'invalid det',
    template: `l #[+value('Gurke', {det:'BLABLAITE'})]`,
    excepted: 'not supported',
  },
  {
    name: 'not a supported German case for determiners',
    template: `l #[+value('Gurke', {case:'INGENITIVE', det:'DEFINITE'})]`,
    excepted: 'case',
  },
  {
    name: 'gender is not in German dict',
    template: `l #[+value('Gurkex', {det:'DEFINITE'})]`,
    excepted: 'German dict',
  },
  {
    name: 'empty table',
    template: `l #{getMFN([], 'Frau')}`,
    excepted: 'table',
  },
  {
    name: 'feminine, must provide 2 elements',
    template: `l #{getMFN(['A'], 'Frau')}`,
    excepted: 'table',
  },
  {
    name: 'neutral, must provide 3 elements',
    template: `l #{getMFN(['A', 'B'], 'Mädchen')}`,
    excepted: 'table',
  },
  {
    name: 'getMFN no gender',
    template: `l #{getMFN(['a','b','c'], {some:'thing'})}`,
    excepted: 'gender',
  },

  {
    name: 'owner has no clear gender',
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
    excepted: 'gender',
  },

  {
    name: 'is not a supported German case for possessives',
    template: `
mixin neu_produkt_ref(obj, params)
  | das Produkt
  - setRefGender(obj, 'N');
mixin neu_produkt_refexpr(obj, params)
  | es
  - setRefGender(obj, 'N');
-
  var NEU_PRODUKT = {neu:'produkt'};
  NEU_PRODUKT.ref = 'neu_produkt_ref';
  NEU_PRODUKT.refexpr = 'neu_produkt_refexpr';

l #[+thirdPossession(NEU_PRODUKT, 'Farbe', {case: 'NOMINATIVE'})]
l #[+thirdPossession(NEU_PRODUKT, 'Farbe', {case: 'BLABLATIVE'})]
`,
    excepted: 'case',
  },
  {
    name: 'not in dict with possessives',
    template: `l #[+thirdPossession('Gurke', 'Mojo', {case:'GENITIVE'})]`,
    excepted: 'dict',
  },
  {
    name: 'is not in German dict',
    template: `- setRefGender({any:'thing'}, 'blablabla_no_in_dict');`,
    excepted: 'dict',
  },
  {
    name: 'value / not in German dict',
    template: `l #[+value('OnePlus 5T', {represents: {bla:'bla'}, gender:'N', det: 'DEMONSTRATIVE', case: 'GENITIVE'})]`,
    excepted: 'dict',
  },
  {
    name: 'setRefGender / not in German dict',
    template: `- setRefGender({bla:'bla'}, 'Gurkex')`,
    excepted: 'dict',
  },
  {
    name: 'recipientPossession not implemented',
    template: `l #[+recipientPossession({bla:'bla'})]`,
    excepted: 'not implemented',
  },
  {
    name: 'verbPart nothing to pop',
    template: `l #[+verbPart]`,
    excepted: 'nothing',
  },
  {
    name: 'invertSubjectVerb must be a boolean',
    template: `l #[+subjectVerb({'bla':'bla'}, {verb:'kennen'}, {'invertSubjectVerb':'bla'})]`,
    excepted: 'boolean',
  },
  ],
  fr_FR:[
  {
    name: 'invalid adjective position',
    template: `l #[+value('arbre', {adj:'vert', adjPos:'AFTERRRR'})]`,
    excepted: 'adjective position',
  },
  {
    name: 'det is not supported',
    template: `l #[+value('arbre', {det:'KRYPTOFINITE', adj:'vert'})]`,
    excepted: 'determiner',
  },
  {
    name: 'its gender is not in French dict',
    template: `l #[+value('arbrex', {det:'DEFINITE'})]`,
    excepted: 'dict',
  },
  {
    name: 'not in French dict',
    template: `l #[+value('<la bon daifukumochi>')]`,
    excepted: 'dict',
  },
  {
    name: 'parse error',
    template: `l #[+value('<blablablabla>')]`,
    excepted: 'parse',
  },

  {
    name: 'number S or P',
    template: `- setRefNumber({bla:'bla'}, null);`,
    excepted: 'must be',
  },
  {
    name: 'null obj',
    template: `- setRefNumber(null, 'P');`,
    excepted: 'empty',
  },
  {
    name: 'is not in French dict',
    template: `- setRefGender({any:'thing'}, 'blablabla_no_in_dict')`,
    excepted: 'dict',
  },
  {
    name: 'invalid French gender',
    template: `- setRefGender({any:'thing'}, 'N');`,
    excepted: 'gender',
  },
  {
    name: 'verbPart only in de_DE',
    template: `l #[+verbPart]`,
    excepted: 'de_DE',
  },
  {
    name: 'invalid adj structure BEFORE / AFTER',
    template: `l #[+value('vache', {adj:{ BLA: ['beau'] } } )]`,
    excepted: 'BEFORE',
  },

  ],
  nl_NL:[ // other languages
  {
    name: 'no determiners',
    template: `l #[+value('man', {det:'DEFINITE'})]`,
    excepted: 'determiners not available',
  },
  {
    name: 'no verbs',
    template: `l #[+verb(getAnonMP(), 'zijn')]`,
    excepted: 'verbs not available',
  },
  {
    name: 'no ORDINAL_TEXTUAL',
    template: `l #[+value(20, {'ORDINAL_TEXTUAL':true })]`,
    excepted: 'ORDINAL_TEXTUAL not available',
  },
  {
    name: 'no ORDINAL_NUMBER',
    template: `l #[+value(20, {'ORDINAL_NUMBER':true })]`,
    excepted: 'ORDINAL_NUMBER not available',
  },
  {
    name: 'no TEXTUAL',
    template: `l #[+value(20, {'TEXTUAL':true })]`,
    excepted: 'TEXTUAL not available',
  },
  {
    name: 'no FORMAT',
    template: `l #[+value(1230974, {'FORMAT': '0.0a'})]`,
    excepted: 'FORMAT not available',
  },
  {
    name: 'no thirdPossession / ref',
    template: `
- var PRODUCT = {};
- PRODUCT.ref = 'PRODUCT_ref';
mixin PRODUCT_ref(obj, params)
  | REF
- PRODUCT.refexpr = 'PRODUCT_refexpr';
mixin PRODUCT_refexpr(obj, params)
  | REFEXPR
l #[+thirdPossession(PRODUCT, 'gewicht')]
`,
    excepted: 'thirdPossession not available',
  },
  {
    name: 'no default sep',
    template: `l #[+value('xxx', { adj: ['aaa', 'bbb', 'ccc']})]`,
    excepted: 'no default last separator',
  },
]
};

describe('freenlg', function() {
  describe('exceptions', function() {

    for (let i=0; i<Object.keys(testCasesPerLang).length; i++) {
      let lang = Object.keys(testCasesPerLang)[i];

      describe(lang, function() {
        for (let j=0; j<testCasesPerLang[lang].length; j++) {
          const testCase = testCasesPerLang[lang][j];
          it(`${testCase.name}`, function() {
            assert.throws(
              () => freenlgPug.render(testCase.template, { language: lang }),
              new RegExp(testCase.excepted),
            );
          });
    
        }
      });
    }
  });
});
