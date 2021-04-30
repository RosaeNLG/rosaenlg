/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const NlgLib = require('rosaenlg/dist/NlgLib.js').NlgLib;

let toto = '';

const nlgLib = new NlgLib({ language: 'fr_FR' });
nlgLib.setSpy({
  getPugHtml: function () {
    return toto;
  },
  setPugHtml: function (new_toto) {
    toto = new_toto;
  },
  appendPugHtml: function (append) {
    toto = toto + append;
  },
  getEmbeddedLinguisticResources: function () {
    return 'TODO';
  },
  getPugMixins: function () {
    // will be a problem for some features
    return null;
  },
});

/*
| il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
| "#{chanson.nom}"
| de #{chanson.auteur}
*/

const chanson = {
  auteur: 'Édith Piaf',
  nom: 'Non, je ne regrette rien',
};

toto += 'il ';

nlgLib.sentenceManager.verb(getAnonMS(), { verb: 'chanter', tense: 'FUTUR' });

toto += ' "' + chanson.nom + '" ';

toto += ' de ' + chanson.auteur;

toto += ' . ';

const res = nlgLib.filterAll(toto);

console.log(res);
