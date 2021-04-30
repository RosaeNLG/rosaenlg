/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const NlgLib = require('rosaenlg/dist/NlgLib.js').NlgLib;

function getAnonMS() {
  return util.genderNumberManager.getAnonMS();
}

const spy = {
  getPugHtml: function () {
    return toto;
  },
  getPugMixins: function () {
    return pug_mixins;
  },
  setPugHtml: function (new_toto) {
    toto = new_toto;
  },
  appendPugHtml: function (append) {
    toto = toto + append;
  },
  appendDoubleSpace: function () {
    toto = toto + '  ';
  },

  getEmbeddedLinguisticResources: function () {
    return 'TODO';
  },

  // we should avoid this one as util. is already available
  isEvaluatingEmpty: function () {
    return util.saveRollbackManager.isEvaluatingEmpty;
  },

  isEvaluatingChoosebest: function () {
    return util.saveRollbackManager.isEvaluatingChoosebest;
  },
};

let toto = '';

/*
| il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
| "#{chanson.nom}"
| de #{chanson.auteur}
*/

const chanson = {
  auteur: 'Édith Piaf',
  nom: 'Non, je ne regrette rien',
};

const util = new NlgLib({ language: 'fr_FR' });
util.setSpy(spy);

toto += 'il ';

util.sentenceManager.verb(getAnonMS(), { verb: 'chanter', tense: 'FUTUR' });

toto += ' "' + chanson.nom + '" ';

toto += ' de ' + chanson.auteur;

toto += ' . ';

const res = util.filterAll(toto);

console.log(res);
