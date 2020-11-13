const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const templateChanson = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
  | "#{chanson.nom}"
  | de #{chanson.auteur}
`;

describe('rosaenlg', function() {
  describe('compile debug', function() {
    const params = {
      language: 'fr_FR',
      chanson: {
        auteur: 'Édith Piaf',
        nom: 'Non, je ne regrette rien',
      },
    };
    params.compileDebug = false;
    const renderedNoDebug = rosaenlgPug.render(templateChanson, params);

    params.compileDebug = true;
    const renderedDebug = rosaenlgPug.render(templateChanson, params);

    it('result should be good', function() {
      assert.strictEqual(renderedNoDebug, `<p>Il chantera "Non, je ne regrette rien" d'Édith Piaf</p>`);
    });

    it('debug and no debug must be the same', function() {
      assert.strictEqual(renderedNoDebug, renderedDebug);
    });
  });
});
