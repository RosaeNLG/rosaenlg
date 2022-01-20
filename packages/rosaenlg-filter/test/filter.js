/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const filter = require('../dist/index.js').filter;
const { getIso2fromLocale, buildLanguageCommon } = require('rosaenlg-commons');

const testCasesList = [
  {
    langs: ['es_ES'],
    cases: [
      // contractions
      ['vas a el hotel', 'Vas al hotel'],
      ['a el hotel', 'Al hotel'],
      ['se fueron a El Paso', 'Se fueron a El Paso'],
      ['la clase de el profesor', 'La clase del profesor'],
      ['De el profesor', 'Del profesor'],
      ['De <b>el profesor</b>', 'Del <b>profesor</b>'],
      ['Es de El Salvador', 'Es de El Salvador'],
      ['la casa de él', 'La casa de él'],

      // classic punctuation must work
      ['bla:bla', 'Bla: bla'],
      ['bla,    bla', 'Bla, bla'],
      ['bla.bla,bla', 'Bla. Bla, bla'],
      ['bla ;bla', 'Bla; bla'],
      ['xxx(yyy)zzz', 'Xxx (yyy) zzz'],

      // specific punctuation
      // ¿
      ['¿ qué?', '¿Qué?'],
      ['¿qué?bla', '¿Qué? Bla'],
      ['bla.¿qué hora es?', 'Bla. ¿Qué hora es?'],
      ['bla ¿ <b>qué</b> hora?', 'Bla ¿<b>Qué</b> hora?'],
      ['¿.qué?', '¿Qué?'],
      // ¡
      ['¡no!', '¡No!'],
      ['¡no!¡no! ¡no!¿si?', '¡No! ¡No! ¡No! ¿Si?'],
    ],
  },

  {
    langs: ['it_IT'],
    cases: [
      // contractions, il/lo etc.
      ['di il signor Rossi', 'Del signor Rossi'],
      ['da la campagna', 'Dalla campagna'],
      ['Il rifugio si trova su la montagna', 'Il rifugio si trova sulla montagna'],

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

      // with html
      ['bla <b>i</b> zingari', 'Bla <b>gli</b> zingari'],
      ['bla i <b>zingari</b>', 'Bla gli <b>zingari</b>'],
      ['bla <b>i zingari</b>', 'Bla <b>gli zingari</b>'],
      ['bla <b>i</b>   <i>zingari</i>', 'Bla <b>gli</b> <i>zingari</i>'],
      ['la <span>alleanza</span>', "L'<span>alleanza</span>"],
      ['bla.una <b>europea</b>', "Bla. Un'<b>europea</b>"],
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

      ['phrase ! <b> autre phrase', 'Phrase\xa0!<b> Autre phrase'],

      // contractions
      ['bla de votre', 'Bla de votre'],
      ['test de un', "Test d'un"],
      ['test de à côté', "Test d'à côté"],
      ['test de À côté', "Test d'À côté"],
      ['bla de §0.35 carat§', 'Bla de 0.35 carat'],
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
      ['Je ne irai pas', "Je n'irai pas"],
      ['Je ne en veut plus', "Je n'en veut plus"],
      ['Je en veut plus', "J'en veut plus"],
      ['Je <b> irai</b>', "J'<b>irai</b>"],
      ['de les', 'Des'],
      ['bla de <b>les tests</b>', 'Bla des <b>tests</b>'],
      ['de <b>les tests</b>', 'Des <b>tests</b>'],

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
      ['bla.À le cinéma', 'Bla. Au cinéma'],

      // new ones
      ['bla de lequel', 'Bla duquel'],
      ['bla de lesquels', 'Bla desquels'],
      ['bla de lesquelles', 'Bla desquelles'],
      ['cela me ira', "Cela m'ira"],
      ['cela te ira', "Cela t'ira"],
      ['cela ne a pas de sens', "Cela n'a pas de sens"],
      ['cela ne me va pas', 'Cela ne me va pas'],
      ['lorsque arrivé', "Lorsqu'arrivé"],
      ['lorsque il', "Lorsqu'il"],
      ['lorsque venu', 'Lorsque venu'],
      ['puisque il', "Puisqu'il"],
      ['puisque il', "Puisqu'il"],
      ['jusque alors', "Jusqu'alors"],
      ['bla à lequel', 'Bla auquel'],
      ['bla à lesquels', 'Bla auxquels'],
      ['bla à lesquelles', 'Bla auxquelles'],
      ['bla que à les', "Bla qu'aux"],

      // we must NOT contract when protected
      ['bla le §Axon BX§', 'Bla le Axon BX'],
      ["bla l'§Axon BX§", "Bla l'Axon BX"],
      ['bla le §OnePlus 5T§', 'Bla le OnePlus 5T'],
      ['bla le mois de §avril§', 'Bla le mois de avril'],
      ['¤le mois de ¤¤¤¤§avril§¤¤¤¤¤', 'Le mois de avril'],
      ['bla ce §avril§', 'Bla ce avril'],

      ['bla la iode', "Bla l'iode"],
      ['bla le iota', 'Bla le iota'],
      ['bla le yaourt', 'Bla le yaourt'],
      ['bla le yéti', 'Bla le yéti'],
      ['ce yéti', 'Ce yéti'],
      ['ce ylang-ylang', 'Cet ylang-ylang'],

      ['bla le Hérisson', 'Bla le Hérisson'],
      ['bla le Hebdomadaire', "Bla l'Hebdomadaire"],

      // http://www.aidenet.eu/grammaire01a.htm#apostrophe
      ["la presqu'île", "La presqu'île"],
      ["presque à l'heure", "Presque à l'heure"],
      // ['quelque un', "Quelqu'un"],
      // ['quelque arbre', 'Quelque arbre'],
      ['suis-je aimé', 'Suis-je aimé'],

      // complex ones
      ['le <i class="toto">hedbomadaire</i>', 'L\'<i class="toto">hedbomadaire</i>'],
      [
        'le <i class="toto">hedbomadaire et le <span>hidalgo</span></i>',
        'L\'<i class="toto">hedbomadaire et l\'<span>hidalgo</span></i>',
      ],
      ['ce <i><b> hedbomadaire </i> </b>', 'Cet <i><b>hedbomadaire</i></b>'],
      ['ce <i><b> hérisson </i> </b>', 'Ce <i><b>hérisson</i></b>'],

      // misc
      ['_TITLECASE_ du vent dans les branches _TITLECASE_', 'Du Vent dans les Branches'],

      // renderDebug
      ['de <span>abord</span>', "D'<span>abord</span>"],
      ['de <span></span>abord', "D'<span></span>abord"],
      [
        'de <span class="rosaenlg-debug" id="/toto/test.pug: 36"></span>abord',
        'D\'<span class="rosaenlg-debug">/toto/test.pug: 36</span>abord',
      ],

      // some debug
      ['bla si il bla', "Bla s'il bla"],
      ['si il', "S'il"],
      ['si ils', "S'ils"],
      ['si elle', 'Si elle'],
      ['si illico', 'Si illico'],
    ],
  },

  {
    langs: ['en_US', 'fr_FR', 'de_DE', 'it_IT', 'es_ES'],
    cases: [
      // spaces ponctuation cleaning etc.
      ['mot1  mot2', 'Mot1 mot2'],
      ['bla ..', 'Bla.'],
      ['bla .   .', 'Bla.'],
      ['bla .. .', 'Bla.'],
      ['toto,il', 'Toto, il'],
      ['toto,   il', 'Toto, il'],
      ['bla, . bla', 'Bla, bla'],
      ['bla,.bla', 'Bla, bla'],
      ['bla  /   bla', 'Bla / bla'],
      ['bla/bla', 'Bla/bla'],
      ['&amp;toto', '&amp;toto'],
      ['bla,.bla', 'Bla, bla'],

      // ...
      ['bla …', 'Bla…'],
      ['bla ...', 'Bla…'],
      ['bla ...bla', 'Bla… bla'],

      ['<li> xxx', '<li>Xxx'],
      ['<li> xxx </li>  <li> xxxx', '<li>Xxx</li><li>Xxxx'],
      ['xxx </li>', 'Xxx</li>'],

      // résidu d'assembly
      ['<p>.</p>', ''],
      ['<p>.</p><p>  . </p><p>.</p>', ''],
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
      ['<span>toto</span>', '<span>Toto</span>'],
      ['<i>toto</i>', '<i>Toto</i>'],
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

      // more quotes, including with parenthesis
      ['blax,"bla"', 'Blax, "bla"'],
      ['blax ( "bla" )bla', 'Blax ("bla") bla'],
      ['blax "bla" ( bla )"bla"', 'Blax "bla" (bla) "bla"'],
      ['blax "aaa" ( "bbb" ) "ccc"', 'Blax "aaa" ("bbb") "ccc"'],

      // escaped blocks
      ['bla §Security Bank Corp. (Philippines)§ bla', 'Bla Security Bank Corp. (Philippines) bla'],
      [
        'bla §Tokio Marine Holdings, Inc.§ and §Nomura Holdings, Inc.§ bla',
        'Bla Tokio Marine Holdings, Inc. and Nomura Holdings, Inc. bla',
      ],

      // bold, italic
      ['<b>sentence . </b> other one', '<b>Sentence.</b> Other one'],
      ['<i>sentence . </i> other one', '<i>Sentence.</i> Other one'],
      ['sentence . <b> other one', 'Sentence.<b> Other one'],
      ['<p>sentence . </p> other one', '<p>Sentence.</p>Other one'],

      // complex html
      [
        'bla <span class="toto" id="tata"> bli <b>blu</b> blo </span>',
        'Bla <span class="toto" id="tata">bli <b>blu</b> blo</span>',
      ],
      ['<p>Only A.</p><l>first, second and third', '<p>Only A.</p><l>First, second and third'],

      // "..."
      ['bla " bla " bla', 'Bla "bla" bla'],
      ['bla " bla " bla "bla "', 'Bla "bla" bla "bla"'],
      ['bla " bla " "bla" bla ', 'Bla "bla" "bla" bla'],
      ['bla"bla "bla', 'Bla "bla" bla'],
      ['bla " bla', 'Bla "bla'],

      // html - special ones
      [
        'bla <ul_block><li_block>bla</li_block><li_block>bla</li_block></ul_block>',
        'Bla <ul><li>Bla</li><li>Bla</li></ul>',
      ],
      ['bla <ul_inline><li_inline>bla</li_inline></ul_inline>', 'Bla <ul><li>bla</li></ul>'],
      ['bla <ol_inline><li_inline>bla</li_inline></ol_inline>', 'Bla <ol><li>bla</li></ol>'],
    ],
  },

  {
    langs: ['en_US'],
    cases: [
      ["the phone 's", "The phone's"],
      ["the phones '", "The phones'"],

      ['bla a European person', 'Bla a European person'],
      ['bla a English man', 'Bla an English man'],
      ['bla a AI company', 'Bla an AI company'],
      ['bla a §AI company§', 'Bla an AI company'],
      ['bla a §AI company a hour§', 'Bla an AI company a hour'],
      ['a AI company', 'An AI company'],
      ['a <b>AI company</b>', 'An <b>AI company</b>'],
      ['a <i>§AI big company§</i>', 'An <i>AI big company</i>'],
      ['bla a', 'Bla a'],
      ['bla a §§', 'Bla a'],
      ['a hour a hour a hour', 'An hour an hour an hour'],

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
      ["the <b>ring</b> 's width", "The <b>ring</b>'s width"],
      ["the <b>earrings</b> 's size", "The <b>earrings</b>' size"],

      // misc
      ['_TITLECASE_ what is this _TITLECASE_', 'What Is This'],
      ['bla a XXXXXXXXX', 'Bla a XXXXXXXXX'],
      ['bla a §XXXXXXXXX§', 'Bla a XXXXXXXXX'],

      ['sentence ! <b> other one', 'Sentence!<b> Other one'],

      // some html
      ['bla <b>bla</b>', 'Bla <b>bla</b>'],
      ['bla : <b>bla</b>', 'Bla: <b>bla</b>'],
    ],
  },

  {
    langs: ['en_US', 'de_DE', 'nl_NL'],
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

  /*
  {
    langs: ['ja_JP'],
    cases: [
      ['私は食べ,私は飲みます', '私は食べ、私は飲みます'],
      ['私は食べます.私は飲みます。', '私は食べます。私は飲みます。'], // No extra space is left after a full stop.
    ],
  },
  */
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

describe('rosaenlg-filter', function () {
  describe('#filter()', function () {
    describe('nominal', function () {
      testCasesList.forEach(function (testCases) {
        describe(`common tests for ${testCases.langs.join(' ')}`, function () {
          testCases.langs.forEach(function (langKey) {
            describe(`${langKey}`, function () {
              const languageCommon = buildLanguageCommon(getIso2fromLocale(langKey));

              testCases.cases.forEach(function (testCase) {
                const orig = testCase[0];
                const expected = testCase[1];

                it(`${orig} => ${expected}`, function () {
                  const filtered = filter(orig, languageCommon, { renderDebug: true });
                  assert.strictEqual(filtered, expected, filtered);
                });
              });
            });
          });
        });
      });
    });
    describe('edge', function () {
      it(`no renderDebug`, function () {
        const filtered = filter(
          'de <span class="rosaenlg-debug" id="/test/bla.pug: 36"></span>abord',
          buildLanguageCommon('fr'),
          {
            renderDebug: false,
          },
        );
        assert.strictEqual(filtered, 'D\'<span class="rosaenlg-debug" id="/test/bla.pug: 36"></span>abord');
      });
      it(`titlecase not available in German`, function () {
        assert.throws(() => filter('_TITLECASE_ xxx _TITLECASE_', buildLanguageCommon('de'), {}), /titlecase/);
      });
      it(`titlecase not available in Italian`, function () {
        assert.throws(() => filter('_TITLECASE_ xxx _TITLECASE_', buildLanguageCommon('it'), {}), /titlecase/);
      });
    });
  });
});
