var junit = require("junit");
const NlgLib = require("freenlg-core").NlgLib;
var it = junit();

const testCasesByLang = {
  'fr_FR': [
    ['bla:bla', 'Bla : bla'],
    ['bla;bla', 'Bla ; bla'],

    // contractions
    ['bla de votre', 'Bla de votre'],
    ['test de un', 'Test d\'un'],
    ['test de à côté', 'Test d\'à côté'],
    ['test de À côté', 'Test d\'À côté'],
    ['bla de 0.35 carat', 'Bla de 0.35 carat'],
    ['test que à', 'Test qu\'à'],
    ['test de le test', 'Test du test'],
    ['test de les test', 'Test des test'],
    ['de les test', 'Des test'],
    ['test des les test', 'Test des test'],
    ['test de le Or', 'Test de l\'Or'],
    ['test se arrêter', 'Test s\'arrêter'],
    ['test se immerger', 'Test s\'immerger'],
    ['test se émanciper', 'Test s\'émanciper'],
    ['se arrêter', 'S\'arrêter'],
    ['se étirer', 'S\'étirer'],
    ['se y rendre', 'S\'y rendre'],
    ['que il ont', 'Qu\'il ont'],
    ['test que ils ont', 'Test qu\'ils ont'],
    ['que il se émancipât', 'Qu\'il s\'émancipât']

  ],  

  'en_US': [

    // en_US specific
    ['bla:bla', 'Bla: bla'],
    
    // COMMON ONES

    // spaces ponctuation etc.
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
    ['bla ! . bla', 'Bla! Bla'],
    ['the phone \'s', 'The phone\'s'],
    ['bla ; bla', 'Bla; bla'],
    ['&amp;toto', '&amp;toto'],

    ['<li> xxx', '<li>xxx'],
    ['xxx </li>', 'Xxx</li>'],

    // ...
    ['bla …', 'Bla…'],
    ['bla ...', 'Bla…'],
    ['bla ...bla', 'Bla… bla'],

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
    ['bla. à côté', 'Bla. À côté'], 
    ['bla. de une part', 'Bla. D\'une part'], 
    ['<p>toto</p>', '<p>Toto</p>'],
    ['<pa>toto</pa>', '<pa>toto</pa>'],
    ['<i>toto</i>', '<i>toto</i>'],
    ['<p> test', '<p>Test'],
    ['<p>the xxx', '<p>The xxx'],
    ['<p>  the xxx', '<p>The xxx'],
    ['  the xxx', 'The xxx'],
    ['xxx. </p>', 'Xxx.</p>'],

    // contractions
    ['bla a AI company', 'Bla an AI company'],
    ['bla a §AI company§', 'Bla an AI company'],
    ['bla a §AI company a hour§', 'Bla an AI company a hour'],
    ['a AI company', 'An AI company'],

    // parenthesis
    ['bla( bla bla )', 'Bla (bla bla)'],
    ['bla(bla', 'Bla (bla'],
    ['bla( bla', 'Bla (bla'],
    ['bla    ( bla', 'Bla (bla'],
    ['bla)bla', 'Bla) bla'],

    // escaped blocks
    ['bla §Security Bank Corp. (Philippines)§ bla', 'Bla Security Bank Corp. (Philippines) bla'],
    ['bla §Tokio Marine Holdings, Inc.§ and §Nomura Holdings, Inc.§ bla', 'Bla Tokio Marine Holdings, Inc. and Nomura Holdings, Inc. bla']
  ]
};


module.exports = it => {
  
  for (var langKey in testCasesByLang) {

    var filterManager = new NlgLib({
      language: langKey
    }).filterManager;
  
    var testCases = testCasesByLang[langKey];

    for (let testCase of testCases) {

      var params = {language: langKey};
  
      var orig = testCase[0];
      var expected = testCase[1];
      var filtered = filterManager.filter(orig, params);
      
      it(testCase, () => it.eq(filtered, expected));
    } 
  
  }

};

