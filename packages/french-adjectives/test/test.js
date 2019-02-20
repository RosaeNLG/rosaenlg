var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [ 'breveté', 'F', 'S', 'brevetée' ],
  [ 'muni', 'F', 'P', 'munies'],
  [ 'fabriqué', 'M', 'S', 'fabriqué'],
  [ 'luxueux', 'F', 'P', 'luxueuses'],
  [ 'rose', 'F', 'P', 'roses' ],
  [ 'bleu', 'F', 'P', 'bleues' ],
  [ 'vert', 'F', 'S', 'verte' ],
  [ 'vairon', 'M', 'P', 'vairons' ],
  [ 'orangé', 'F', 'P', 'orangées' ],
  [ 'alezan', 'M', 'P', 'alezans' ],
  [ 'blond', 'M', 'P', 'blonds' ],    
  [ 'châtain', 'F', 'P', 'châtains'],
  [ 'majeur', 'F', 'S', 'majeure' ],
  [ 'rieur', 'F', 'S', 'rieuse' ],
  [ 'vengeur', 'F', 'P', 'vengeresses' ],
  [ 'créateur', 'F', 'S', 'créatrice' ],
  [ 'aérien', 'F', 'S', 'aérienne' ],
  [ 'annuel', 'F', 'S', 'annuelle' ],
  [ 'bas', 'F', 'S', 'basse' ],
  [ 'gentil', 'F', 'S', 'gentille' ],
  [ 'net', 'F', 'S', 'nette' ],
  [ 'meilleur', 'F', 'P', 'meilleures' ],
  [ 'ambigu', 'F', 'S', 'ambiguë' ],
  [ 'vermeil', 'F', 'S', 'vermeille'],
  [ 'oblong', 'F', 'P', 'oblongues'],
  [ 'rêveur', 'F', 'P', 'rêveuses'],
  [ 'corail', 'F', 'P', 'corail' ],
  [ 'heureux', 'M', 'P', 'heureux' ],
  [ 'heureux', 'F', 'P', 'heureuses' ],
  [ 'royal', 'M', 'P', 'royaux' ],
  [ 'vieux', 'F', 'S', 'vieille' ],
  [ 'jeunot', 'F', 'P', 'jeunottes' ],
  [ 'pâlot', 'F', 'S', 'pâlotte' ],
  [ 'maison', 'F', 'P', 'maison' ],
  [ 'vieux', 'M', 'S', 'vieux' ],
  [ 'bleu', 'M', 'P', 'bleus' ],
  [ 'natal', 'M', 'P', 'natals' ],

  [ 'vieux', 'M', 'S', 'vieil', 'homme', true ],
  [ 'fou', 'M', 'S', 'fol', 'homme', true ],
  [ 'fou', 'F', 'S', 'folle', 'femme', true ],
  [ 'fou', 'M', 'S', 'fou', 'homme', false ],
  [ 'mou', 'M', 'S', 'mol', 'ectoplasme', true ],
];


describe('french-adjectives', function() {
  describe('#agree()', function() {
    for (var i=0; i<testCases.length; i++) {
      const testCase = testCases[i];
      const root = testCase[0];
      const gender = testCase[1];
      const number = testCase[2];
      const expected = testCase[3];
      let isBeforeNoun;
      let noun = null;
      if (testCase.length>4) { 
        noun = testCase[4];
        isBeforeNoun = testCase[5];
      }
  
      let blabla;
      if (isBeforeNoun) {
        blabla = `${noun} ${root} ${gender} ${number} => ${expected}`
      } else {
        blabla = `${root} ${gender} ${number} => ${expected}`
      }
  
      it(
        blabla, () => 
        assert.equal( lib.agree( root, gender, number, noun, isBeforeNoun), expected )
      );
    }
  });
});

