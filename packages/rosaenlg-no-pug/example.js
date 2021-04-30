/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const NlgLib = require('rosaenlg/dist/NlgLib.js').NlgLib;

function getAnonMS() {
  return util.genderNumberManager.getAnonMS();
}

require('../rosaenlg/mixins/spy.js');

console.log(spy);

let pug_html = '';

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

pug_html += 'il ';

util.sentenceManager.verb(getAnonMS(), { verb: 'chanter', tense: 'FUTUR' });

pug_html += ' "' + chanson.nom + '" ';

pug_html += ' de ' + chanson.auteur;

pug_html += ' . ';

const res = util.filterAll(pug_html);

console.log(res);
