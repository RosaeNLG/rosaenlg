/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');

const NlgLib = require('rosaenlg/dist/NlgLib.js').NlgLib;

describe('no-pug', function () {
  it(`chanson`, function () {
    let tmp = '';

    const nlgLib = new NlgLib({ language: 'fr_FR' });
    nlgLib.setSpy({
      getPugHtml: function () {
        return tmp;
      },
      setPugHtml: function (new_tmp) {
        tmp = new_tmp;
      },
      appendPugHtml: function (append) {
        tmp = tmp + append;
      },
      getEmbeddedLinguisticResources: function () {
        return 'TODO';
      },
      getPugMixins: function () {
        // will be a problem for some features
        return null;
      },
    });

    const chanson = {
      auteur: 'Édith Piaf',
      nom: 'Non, je ne regrette rien',
    };

    /*
    | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
    | "#{chanson.nom}"
    | de #{chanson.auteur}
    */
    tmp += 'il ';
    nlgLib.sentenceManager.verb(nlgLib.genderNumberManager.getAnonMS(), { verb: 'chanter', tense: 'FUTUR' });
    tmp += ' "' + chanson.nom + '" ';
    tmp += ' de ' + chanson.auteur;
    tmp += ' . ';
    const rendered = nlgLib.filterAll(tmp);

    assert.strictEqual(rendered, 'Il chantera "Non, je ne regrette rien" d\'Édith Piaf.');
  });
});
