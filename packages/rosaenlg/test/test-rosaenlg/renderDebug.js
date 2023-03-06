/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');
const NlgLib = require('rosaenlg-lib').NlgLib;

const templateChanson = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
  | "#{chanson.nom}"
  | de #{chanson.auteur}
`;

const templateSynonyms = `
| begin
eachz elt in ['A', 'B', 'C', 'D', 'E']
  | #{elt}
  eachz elt2 in [1, 2]
    synz
      syn
        | bla
      syn
        | bli
      syn
        | blu
| end
`;

const templateSynonymsChooseBest = `
| begin
choosebest {among:10}
  eachz elt in ['A', 'A', 'C', 'C', 'A', 'A']
    | #{elt}
    eachz elt2 in [1, 2, 3, 4]
      synz
        syn
          | bla
        syn
          | bli
        syn
          | blu
        syn
          | bly
| end
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
      it('with synonyms, must have same result', function () {
        const seed = 3642;

        const renderedNoDebug = rosaenlgPug.render(templateSynonyms, {
          renderDebug: false,
          forceRandomSeed: seed,
          language: 'en_US',
        });
        const cleanedNoDebug = renderedNoDebug.replace(/\s/g, '');

        const renderedDebug = rosaenlgPug.render(templateSynonyms, {
          renderDebug: false,
          forceRandomSeed: seed,
          language: 'en_US',
          renderDebug: true,
        });
        const cleanedDebug = renderedDebug
          .replace(/<span class=\"rosaenlg-debug\">.*?<\/span>/g, '')
          .replace(/\s/g, '');

        assert.strictEqual(cleanedNoDebug, cleanedDebug);
      });
      it('with synonyms and choosebest, must have same result', function () {
        const seed = 3642;

        const renderedNoDebug = rosaenlgPug.render(templateSynonymsChooseBest, {
          renderDebug: false,
          forceRandomSeed: seed,
          language: 'en_US',
        });
        const cleanedNoDebug = renderedNoDebug.replace(/\s/g, '');

        const renderedDebug = rosaenlgPug.render(templateSynonymsChooseBest, {
          renderDebug: false,
          forceRandomSeed: seed,
          language: 'en_US',
          renderDebug: true,
        });
        const cleanedDebug = renderedDebug
          .replace(/<span class=\"rosaenlg-debug\">.*?<\/span>/g, '')
          .replace(/\s/g, '');

        assert.strictEqual(cleanedNoDebug, cleanedDebug);
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
