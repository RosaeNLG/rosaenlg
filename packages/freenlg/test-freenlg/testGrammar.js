var junit = require("junit");

const NlgLib = require("freenlg-core").NlgLib;

// could be cleaner
const parseFrench = require("../../freenlg-core/dist/french-grammar.js").parse;

var it = junit();

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
  ]
}

/*

TODO
cette exquis bague (PRODUIT4)
ce anneau (PRODUIT4)
*/


module.exports = it => {

  for (let langKey in testCasesList) {
    const lefffHelper = new NlgLib({language: langKey}).lefffHelper;

    let cases = testCasesList[langKey];
    for (let i=0; i<cases.length; i++) {
      let toParse = cases[i][0];
      let expected = cases[i][1];

      let parsed = parseFrench(toParse, {lefffHelper: lefffHelper});
      // console.log(parsed);
      
      it(toParse, () => it.eq(parsed, expected));

    }
  }

};
