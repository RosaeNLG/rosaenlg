var assert = require('assert');
var filter = require('../dist/index.js').filter;

const testCasesList = [
  {
    langs: ['it_IT'],
    cases: [
      // contractions, il/lo etc.

      // definite masc sing
      // il
      ['bla il romano', 'Bla il romano'],
      ['bla lo romano', 'Bla il romano'],
      ['bla . Lo romano', 'Bla. Il romano'],
      ['bla il dio', 'Bla il dio'],
      ['bla lo dio', 'Bla il dio'],
      // lo
      ['bla lo straniero', 'Bla lo straniero'],
      ['bla il straniero', 'Bla lo straniero'],
      ['bla lo studente', 'Bla lo studente'],
      ['bla il studente', 'Bla lo studente'],
      ['bla.il studente', 'Bla. Lo studente'],
      ['bla lo zingaro', 'Bla lo zingaro'],
      ['bla il zingaro', 'Bla lo zingaro'],
      ['bla lo psicologo', 'Bla lo psicologo'],
      ['bla il psicologo', 'Bla lo psicologo'],
      // l'
      ['bla il europeo', "Bla l'europeo"],
      ['bla lo europeo', "Bla l'europeo"],
      ['bla.lo europeo', "Bla. L'europeo"],
      ["bla l'europeo", "Bla l'europeo"],
      ['bla il inno', "Bla l'inno"],
      ['bla lo inno', "Bla l'inno"],
      ["bla l'inno", "Bla l'inno"],
      ["bla.l'inno", "Bla. L'inno"],
      // definite masc plural
      ['bla i romani', 'Bla i romani'],
      ['bla gli romani', 'Bla i romani'],
      ['bla . gli romani', 'Bla. I romani'],
      ['bla i stranieri', 'Bla gli stranieri'],
      ['bla gli stranieri', 'Bla gli stranieri'],
      ['bla i zingari', 'Bla gli zingari'],
      ['bla gli zingari', 'Bla gli zingari'],
      ['bla i europei', 'Bla gli europei'],
      ['bla. i europei', 'Bla. Gli europei'],
      ['bla gli europei', 'Bla gli europei'],
      ['bla i psicologi', 'Bla gli psicologi'],
      ['bla gli psicologi', 'Bla gli psicologi'],
      ['bla i dei', 'Bla gli dei'],
      ['bla gli dei', 'Bla gli dei'],
      // definite fem sing
      ['bla la romana', 'Bla la romana'],
      ['bla la iucca', 'Bla la iucca'],
      ['bla.la iucca', 'Bla. La iucca'],
      ['bla la europea', "Bla l'europea"],
      ['la alleanza', "L'alleanza"],
      ['bla .la europea', "Bla. L'europea"],
      ["bla l'europea", "Bla l'europea"],
      // definite fem plural
      ['bla le romane', 'Bla le romane'],
      ['bla le europee', 'Bla le europee'],
      // indefinite masc
      ['bla un romano', 'Bla un romano'],
      ['bla uno romano', 'Bla un romano'],
      ['bla un europeo', 'Bla un europeo'],
      ['bla uno europeo', 'Bla un europeo'],
      ['bla un bel ricordo', 'Bla un bel ricordo'],
      ['bla uno bel ricordo', 'Bla un bel ricordo'],
      ['bla un uomo', 'Bla un uomo'],
      ['bla. un uomo', 'Bla. Un uomo'],
      ['bla uno uomo', 'Bla un uomo'],
      ['bla un straniero', 'Bla uno straniero'],
      ['bla.un straniero', 'Bla. Uno straniero'],
      ['bla uno straniero', 'Bla uno straniero'],
      ['bla un psicologo', 'Bla uno psicologo'],
      ['bla uno psicologo', 'Bla uno psicologo'],
      ['bla un yogurt', 'Bla uno yogurt'],
      ['bla uno yogurt', 'Bla uno yogurt'],
      // indefinite fem
      ['bla una romana', 'Bla una romana'],
      ['bla.una romana', 'Bla. Una romana'],
      ['bla una straniera', 'Bla una straniera'],
      ['bla una zingara', 'Bla una zingara'],
      ['bla una europea', "Bla un'europea"],
      ['bla.una europea', "Bla. Un'europea"],
      ["bla un'europea", "Bla un'europea"],
      ['bla una asta', "Bla un'asta"],
      ["bla un'asta", "Bla un'asta"],
    ],
  },
  {
    langs: ['fr_FR'],
    cases: [
      // punctuation
      ['bla:bla', 'Bla\xa0: bla'],
      ['bla;bla', 'Bla\xa0; bla'],

      ['bla    ?  bla', 'Bla\xa0? Bla'],
      ['bla?bla', 'Bla\xa0? Bla'],
      ['bla? bla', 'Bla\xa0? Bla'],

      ['bla ! . bla', 'Bla\xa0! Bla'],
      ['bla!bla', 'Bla\xa0! Bla'],

      ['bla. à côté', 'Bla. À côté'],

      // contractions
      ['bla de votre', 'Bla de votre'],
      ['test de un', "Test d'un"],
      ['test de à côté', "Test d'à côté"],
      ['test de À côté', "Test d'À côté"],
      ['bla de 0.35 carat', 'Bla de 0.35 carat'],
      ['test que à', "Test qu'à"],
      ['test de le test', 'Test du test'],
      ['test de les test', 'Test des test'],
      ['de les test', 'Des test'],
      ['test des les test', 'Test des test'],
      ['test de le Or', "Test de l'Or"],
      ['test se arrêter', "Test s'arrêter"],
      ['test se immerger', "Test s'immerger"],
      ['test se émanciper', "Test s'émanciper"],
      ['se arrêter', "S'arrêter"],
      ['se étirer', "S'étirer"],
      ['se y rendre', "S'y rendre"],
      ['que il ont', "Qu'il ont"],
      ['test que ils ont', "Test qu'ils ont"],
      ['que il se émancipât', "Qu'il s'émancipât"],
      ['bla. de une part', "Bla. D'une part"],
      ['bla. je aime', "Bla. J'aime"],
      ['Je irai', "J'irai"],

      ['<p>le arbre', "<p>L'arbre"],

      ['ce arbre', 'Cet arbre'],
      ['Ce arbre', 'Cet arbre'],
      ['ce sapin', 'Ce sapin'],
      ['<p>ce anneau', '<p>Cet anneau'],

      ['le hebdomadaire', "L'hebdomadaire"],
      ['le héraut', 'Le héraut'],
      ['le hors-la-loi', 'Le hors-la-loi'],
      ['le haricot', 'Le haricot'],

      ['ce hebdomadaire', 'Cet hebdomadaire'],
      ['ce hérisson', 'Ce hérisson'],

      ['bla à la maison', 'Bla à la maison'],
      ['bla à le école', "Bla à l'école"],
      ['bla à le cinéma', 'Bla au cinéma'],
      ['bla à les étudiants', 'Bla aux étudiants'],

      // misc
      ['_TITLECASE_ du vent dans les branches _TITLECASE_', 'Du Vent dans les Branches'],
    ],
  },

  {
    langs: ['en_US', 'fr_FR', 'de_DE', 'it_IT'],
    cases: [
      // spaces ponctuation cleaning etc.
      ['mot1  mot2', 'Mot1 mot2'],
      ['bla ..', 'Bla.'],
      ['bla .   .', 'Bla.'],
      ['bla .. .', 'Bla.'],
      ['toto,il', 'Toto, il'],
      ['toto,   il', 'Toto, il'],
      ['bla, . bla', 'Bla. Bla'],
      ['bla,.bla', 'Bla. Bla'],
      ['bla  /   bla', 'Bla / bla'],
      ['bla/bla', 'Bla/bla'],

      ['&amp;toto', '&amp;toto'],

      // ...
      ['bla …', 'Bla…'],
      ['bla ...', 'Bla…'],
      ['bla ...bla', 'Bla… bla'],

      ['<li> xxx', '<li>xxx'],
      ['xxx </li>', 'Xxx</li>'],

      // résidu d'assembly
      ['<p>.</p>', ''],
      ['</p>.</p>', '</p></p>'],
      ['</p> . </p>', '</p></p>'],
      ['bla bla. </p>', 'Bla bla.</p>'],
      ['bla.  .   </p>', 'Bla.</p>'],
      ['bla  .   </p>', 'Bla.</p>'],
      ['bla   </p>', 'Bla</p>'],

      // capitalization
      ['bla.bla', 'Bla. Bla'],
      ['bla.Bla', 'Bla. Bla'],
      ['bla. bla', 'Bla. Bla'],

      ['<p>toto</p>', '<p>Toto</p>'],
      ['<pa>toto</pa>', '<pa>toto</pa>'],
      ['<i>toto</i>', '<i>toto</i>'],
      ['<p> test', '<p>Test'],
      ['<p>the xxx', '<p>The xxx'],
      ['<p>  the xxx', '<p>The xxx'],
      ['  the xxx', 'The xxx'],
      ['xxx. </p>', 'Xxx.</p>'],

      // parenthesis
      ['bla( bla bla )', 'Bla (bla bla)'],
      ['bla(bla', 'Bla (bla'],
      ['bla( bla', 'Bla (bla'],
      ['bla    ( bla', 'Bla (bla'],
      ['bla)bla', 'Bla) bla'],

      // escaped blocks
      ['bla §Security Bank Corp. (Philippines)§ bla', 'Bla Security Bank Corp. (Philippines) bla'],
      [
        'bla §Tokio Marine Holdings, Inc.§ and §Nomura Holdings, Inc.§ bla',
        'Bla Tokio Marine Holdings, Inc. and Nomura Holdings, Inc. bla',
      ],
    ],
  },

  {
    langs: ['en_US'],
    cases: [
      ["the phone 's", "The phone's"],
      ["the phones '", "The phones'"],

      ['bla a AI company', 'Bla an AI company'],
      ['bla a §AI company§', 'Bla an AI company'],
      ['bla a §AI company a hour§', 'Bla an AI company a hour'],
      ['a AI company', 'An AI company'],
      ["Cinderella's stepmother ", "Cinderella's stepmother"],
      ["how's it going?", "How's it going?"],

      // a history, a hobby, but an hour, an honor
      ['a history', 'A history'],
      ['a hobby', 'A hobby'],
      ['a hour', 'An hour'],
      ['a honour', 'An honour'],
      // ['a honorable man', 'An honorable man'], does not work

      // possessives
      ["the ring's width", "The ring's width"],
      ["the earrings's width", "The earrings' width"],
      ["the §earrings§ 's width", "The earrings' width"],
      ["the earrings's size", "The earrings' size"],

      // misc
      ['_TITLECASE_ what is this _TITLECASE_', 'What Is This'],
      ['bla a XXXXXXXXX', 'Bla a XXXXXXXXX'],
      ['bla a §XXXXXXXXX§', 'Bla a XXXXXXXXX'],
    ],
  },

  {
    langs: ['en_US', 'de_DE'],
    cases: [
      // punctuation
      ['bla:bla', 'Bla: bla'],
      ['bla ; bla', 'Bla; bla'],

      ['bla ! . bla', 'Bla! Bla'],
      ['bla?bla', 'Bla? Bla'],

      ['bla  !   bla', 'Bla! Bla'],

      // misc
      ['bla. de une part', 'Bla. De une part'],
    ],
  },

  {
    langs: ['de_DE'],
    cases: [
      // ne doivent pas être transformés par le filtrage
      ["test des Prinz' Ross", "Test des Prinz' Ross"],
      ["test des Prinz'    Ross", "Test des Prinz' Ross"],
      ["wie geht's?", "Wie geht's?"],
      ["ich hab'", "Ich hab'"],
    ],
  },
];

describe('freenlg-filter', function() {
  describe('#filter()', function() {
    describe('nominal', function() {
      testCasesList.forEach(function(testCases) {
        describe(`common tests for ${testCases.langs.join(' ')}`, function() {
          testCases.langs.forEach(function(langKey) {
            describe(`${langKey}`, function() {
              testCases.cases.forEach(function(testCase) {
                const orig = testCase[0];
                const expected = testCase[1];

                it(`${orig} => ${expected}`, function() {
                  const filtered = filter(orig, langKey);
                  assert.equal(filtered, expected);
                });
              });
            });
          });
        });
      });
    });
    describe('edge', function() {
      it(`invalid language`, function() {
        assert.throws(() => filter('bla', 'KLINGON'), /language/);
      });
      it(`titlecase not available in German`, function() {
        assert.throws(() => filter('_TITLECASE_ xxx _TITLECASE_', 'de_DE'), /titlecase/);
      });
      it(`titlecase not available in Italian`, function() {
        assert.throws(() => filter('_TITLECASE_ xxx _TITLECASE_', 'it_IT'), /titlecase/);
      });
    });
  });
});
