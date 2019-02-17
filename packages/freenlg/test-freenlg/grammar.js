var assert = require('assert');
const NlgLib = require("freenlg-core").NlgLib;

// could be cleaner
const parseFrench = require("../../freenlg-core/dist/french-grammar.js").parse;
const parseGerman = require("../../freenlg-core/dist/german-grammar.js").parse;
const parsersMapping = {
  'fr_FR': parseFrench,
  'de_DE': parseGerman
};


const testCasesList = {
  'fr_FR': [
    ["ce anneau",    {det:'DEMONSTRATIVE', noun:'anneau'} ],
    ["ce bel arbre", {det:'DEMONSTRATIVE', adj:'beau', adjPos:'BEFORE', noun:'arbre'}  ],
    ["le beau arbre F", {det:'DEFINITE', adj:'beau', adjPos:'BEFORE', noun:'arbre', gender:'F'} ],
    ["beau arbre F", {adj:'beau', adjPos:'BEFORE', noun:'arbre', gender:'F'} ],
    ["beau arbre", {adj:'beau', adjPos:'BEFORE', noun:'arbre'} ],
    ["le beau arbre", {det:'DEFINITE', adj:'beau', adjPos:'BEFORE', noun:'arbre'} ],
    ["la arbre", {det:'DEFINITE', noun:'arbre'} ],
    ["arbre", {noun:'arbre'} ],
    ["ce été", {det:'DEMONSTRATIVE', noun:'été'} ],
    ["un beau hâbleur", {det:'INDEFINITE', noun:'hâbleur', adj:'beau', adjPos:'BEFORE'} ],  
    ["ce exquis bague", {det:'DEMONSTRATIVE', noun:'bague', adj:'exquis', adjPos:'BEFORE'} ],
    ["une beau hommes", {det:'INDEFINITE', noun:'homme', adj:'beau', adjPos:'BEFORE'} ],
    ["les belles fleurs FP", {det:'DEFINITE', noun:'fleur', adj:'beau', adjPos:'BEFORE', gender:'F', number:'P'} ],
    ["les belles fleurs P", {det:'DEFINITE', noun:'fleur', adj:'beau', adjPos:'BEFORE', number:'P'} ],
    ["les belles fleurs P F", {det:'DEFINITE', noun:'fleur', adj:'beau', adjPos:'BEFORE', gender:'F', number:'P'} ],
    ["ce ancien maison", {det:'DEMONSTRATIVE', noun:'maison', adj:'ancien', adjPos:'BEFORE'} ],

    // ["cette maison ancienne", {det:'DEMONSTRATIVE', adj:'ancien', adjPos:'AFTER', noun:'maison'}],
  ],

  'de_DE': [
    ["das große Gurke", {det:'DEFINITE', noun:'Gurke', adj:'groß'} ],
    ["die neue Telefon", {det:'DEFINITE', noun:'Telefon', adj:'neu'} ],
    ["der alt Gurke", {noun:'Gurke', det:'DEFINITE', adj:'alt'}],
    ["dieses alt Telefon", {adj:'alt', noun:'Telefon', det:'DEMONSTRATIVE'}],
    ["dieser neue Gurke", {adj:'neu', noun:'Gurke', det:'DEMONSTRATIVE'}],
    ["der Auto", {noun:'Auto', det:'DEFINITE'}],
    ["Auto", {noun:'Auto'}],
    ["alt Auto", {adj:'alt', noun:'Auto'}],
    ["das gut Schwarzwald", {noun:'Schwarzwald', det:'DEFINITE', adj:'gut'}],
    ["das gut Daifukumochi M", {noun:'Daifukumochi', det:'DEFINITE', adj:'gut', gender:'M', unknownNoun:true}],
  ]

}


describe('freenlg', function() {
  describe('grammar', function() {


    for (let langKey in testCasesList) {
      const dictHelper = new NlgLib({language: langKey}).dictHelper;
  
      let cases = testCasesList[langKey];
      for (let i=0; i<cases.length; i++) {
        let toParse = cases[i][0];
        let expected = cases[i][1];
  
        let parsed = parsersMapping[langKey](toParse, {dictHelper: dictHelper});
        // console.log(parsed);

        it(`${langKey} ${toParse}`, function() {
          assert.deepEqual(parsed, expected)
        });
        
      }
    }

  });
});

