/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');

const NlgLib = require('rosaenlg-lib').NlgLib;

describe('no-pug', function () {
  it(`basic verb`, function () {
    const nlgLib = new NlgLib({ language: 'fr_FR' });
    nlgLib.sentenceManager.verb(nlgLib.genderNumberManager.getAnonMS(), { verb: 'devenir', tense: 'FUTUR' });
    const rendered = nlgLib.getFiltered();
    assert.strictEqual(rendered, 'Deviendra');
  });

  it(`syn`, function () {
    const nlgLib = new NlgLib({ language: 'en_US' });

    /*
    synz
      syn
        | bla
      syn
        | blu
    */

    nlgLib.synManager.runSynz(
      (pos) => {
        switch (pos) {
          case 1: {
            nlgLib.spy.appendPugHtml('bla');
            break;
          }
          case 2: {
            nlgLib.spy.appendPugHtml('blu');
            break;
          }
        }
      },
      'somename',
      2,
      {},
    );

    const rendered = nlgLib.getFiltered();
    assert(rendered === 'Bla' || rendered === 'Blu');
  });

  it(`loop`, function () {
    const nlgLib = new NlgLib({ language: 'en_US' });
    const data = ['apples', 'bananas', 'apricots', 'pears'];
    /*
    eachz fruit in data with { separator: ',', last_separator: 'and', begin_with_general: 'I love', end:'!' }
      | #{fruit}
    */
    nlgLib.asmManager.foreach(
      data,
      (fruit) => {
        nlgLib.spy.appendPugHtml(fruit);
      },
      {
        separator: ',',
        last_separator: 'and',
        begin_with_general: 'I love',
        end: '!',
      },
    );

    const rendered = nlgLib.getFiltered();

    assert.strictEqual(rendered, 'I love apples, bananas, apricots and pears!');
  });

  it(`embedded verb`, function () {
    const nlgLib = new NlgLib({ language: 'fr_FR' });
    nlgLib.setEmbeddedLinguisticResources({
      verbs: {
        manger: {
          F: ['mangerai', 'mangeras', 'mangeraXXX', 'mangerons', 'mangerez', 'mangeront'],
        },
      },
    });

    nlgLib.sentenceManager.verb(nlgLib.genderNumberManager.getAnonMS(), { verb: 'manger', tense: 'FUTUR' });
    const rendered = nlgLib.getFiltered();

    assert.strictEqual(rendered, 'MangeraXXX');
  });
  it(`with helper function`, function () {
    function conjVerb(verb, tense) {
      const nlgLib = new NlgLib({ language: 'fr_FR' });
      nlgLib.sentenceManager.verb(nlgLib.genderNumberManager.getAnonMS(), { verb: verb, tense: tense });
      return nlgLib.getFiltered();
    }

    assert.strictEqual(conjVerb('aller', 'FUTUR'), 'Ira');
    assert.strictEqual(conjVerb('voir', 'FUTUR'), 'Verra');
    assert.strictEqual(conjVerb('être', 'FUTUR'), 'Sera');
  });

  it(`chanson`, function () {
    const nlgLib = new NlgLib({ language: 'fr_FR' });
    const chanson = {
      auteur: 'Édith Piaf',
      nom: 'Non, je ne regrette rien',
    };

    /*
    | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
    | "#{chanson.nom}"
    | de #{chanson.auteur} .
    */
    nlgLib.spy.appendPugHtml('il ');
    nlgLib.sentenceManager.verb(nlgLib.genderNumberManager.getAnonMS(), { verb: 'chanter', tense: 'FUTUR' });
    nlgLib.spy.appendPugHtml(' "' + chanson.nom + '" ');
    nlgLib.spy.appendPugHtml(' de ' + chanson.auteur);
    nlgLib.spy.appendPugHtml(' . ');
    const rendered = nlgLib.getFiltered();

    assert.strictEqual(rendered, 'Il chantera "Non, je ne regrette rien" d\'Édith Piaf.');
  });
});
