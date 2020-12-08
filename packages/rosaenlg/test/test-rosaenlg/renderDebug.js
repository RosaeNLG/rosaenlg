/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');
const NlgLib = require('../../dist/NlgLib').NlgLib;

const templateChanson = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
  | "#{chanson.nom}"
  | de #{chanson.auteur}
`;

describe('rosaenlg', function () {
  describe('render debug', function () {
    describe('activated', function () {
      it('check for traces in output', function () {
        const rendered = rosaenlgPug.render(templateChanson, {
          renderDebug: true,
          language: 'fr_FR',
          chanson: {
            nom: 'la vie du bon coté',
            auteur: "Keen'v",
          },
        });
        // console.log(rendered);
        assert(rendered.includes('span class="rosaenlg-debug"'));
      });
      it('check for traces in output - with file version', function () {
        const rendered = rosaenlgPug.renderFile(__dirname + '/fr_FR/chanson.pug', {
          renderDebug: true,
          language: 'fr_FR',
          chanson: {
            nom: 'la vie du bon coté',
            auteur: "Keen'v",
          },
        });
        // console.log(rendered);
        assert(rendered.includes('chanson.pug'));
      });
      it('is not a compile option but a render option', function () {
        const compiled = rosaenlgPug.compile(templateChanson, {
          language: 'fr_FR',
        });

        const rendered = compiled({
          renderDebug: true,
          chanson: {
            nom: 'la vie du bon coté',
            auteur: "Keen'v",
          },
          util: new NlgLib({ language: 'fr_FR' }),
        });

        // console.log(rendered);
        assert(rendered.includes('span class="rosaenlg-debug"'));
      });

      it('not possible when no compileDebug', function () {
        const compiled = rosaenlgPug.compile(templateChanson, {
          language: 'fr_FR',
          compileDebug: false,
        });

        const rendered = compiled({
          renderDebug: true,
          chanson: {
            nom: 'la vie du bon coté',
            auteur: "Keen'v",
          },
          util: new NlgLib({ language: 'fr_FR' }),
        });

        // console.log(rendered);
        assert(!rendered.includes('span class="rosaenlg-debug"'));
      });

      it('phones tutorial', function () {
        const rendered = rosaenlgPug.renderFile(`../rosaenlg-doc/doc/modules/tutorials/partials/tuto_en_US.pug`, {
          language: 'en_US',
          renderDebug: true,
          phones: [
            {
              name: 'OnePlus 5T',
              colors: ['Black', 'Red', 'White'],
              displaySize: 6,
              screenRatio: 80.43,
              battery: 3300,
            },
          ],
        });
        // console.log(rendered);
        const count = (rendered.match(/span class="rosaenlg-debug"/g) || []).length;
        assert(count > 5);
      });
    });
    describe('not activated', function () {
      it('no traces in output', function () {
        const rendered = rosaenlgPug.render(templateChanson, {
          language: 'fr_FR',
          chanson: {
            nom: 'la vie du bon coté',
            auteur: "Keen'v",
          },
        });
        // console.log(rendered);
        assert(!rendered.includes('span class="rosaenlg-debug"'));
      });
    });
  });
});
