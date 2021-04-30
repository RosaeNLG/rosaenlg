/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');

const NlgLib = require('rosaenlg/dist/NlgLib.js').NlgLib;

describe('no-pug', function () {
  it(`loop`, function () {
    let tmp = '';

    // TODO remove the need for this awful stuff
    let context = {};

    const nlgLib = new NlgLib({ language: 'en_US' });
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
      getPugMixins: function () {
        return context;
      },
    });

    const data = ['apples', 'bananas', 'apricots', 'pears'];
    /*
    eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
      | #{fruit}
    */
    function showFruit(fruit) {
      tmp += fruit;
    }
    context['showFruit'] = showFruit;
    nlgLib.asmManager.foreach(data, 'showFruit', {
      separator: ',',
      last_separator: 'and',
      begin_with_general: 'I love',
      end: '!',
    });

    const rendered = nlgLib.filterAll(tmp);

    assert.strictEqual(rendered, 'I love apples, bananas, apricots and pears!');
  });

  it(`embedded verb`, function () {
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
        return {
          verbs: {
            manger: {
              F: ['mangerai', 'mangeras', 'mangeraXXX', 'mangerons', 'mangerez', 'mangeront'],
            },
          },
        };
      },
    });

    nlgLib.sentenceManager.verb(nlgLib.genderNumberManager.getAnonMS(), { verb: 'manger', tense: 'FUTUR' });
    const rendered = nlgLib.filterAll(tmp);

    assert.strictEqual(rendered, 'MangeraXXX');
  });

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
    });

    const chanson = {
      auteur: 'Édith Piaf',
      nom: 'Non, je ne regrette rien',
    };

    /*
    | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
    | "#{chanson.nom}"
    | de #{chanson.auteur} .
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
