/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const templateChanson = `
p
  | il #[+verb(getAnonMS(), {verb: 'chanter', tense:'FUTUR'} )]
  | "#{chanson.nom}"
  | de #{chanson.auteur}
`;

function checkErr(err, name, line, message) {
  assert(err instanceof Error);
  assert.strictEqual(err.name, name);
  assert(err.message.indexOf('Pug:' + line) > -1, `Pug: with line not found in ${err}`);
  assert(err.message.indexOf(`> ${line}|`) > -1, `> with line not found in ${err}`);
  assert(err.message.indexOf(message) > -1, `${message} not found in ${err}`);
  return true;
}

describe('rosaenlg', function () {
  describe('compile debug', function () {
    describe('same render result', function () {
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

      it('result should be good', function () {
        assert.strictEqual(renderedNoDebug, `<p>Il chantera "Non, je ne regrette rien" d'Édith Piaf</p>`);
      });

      it('debug and no debug must be the same', function () {
        assert.strictEqual(renderedNoDebug, renderedDebug);
      });
    });

    describe('point errors', function () {
      it('should point null errors', function () {
        assert.throws(
          () =>
            rosaenlgPug.render(templateChanson, {
              language: 'fr_FR',
              compileDebug: true,
            }),
          (err) => checkErr(err, 'TypeError', 4, 'Cannot read property'),
        );
      });

      it('not in dict', function () {
        assert.throws(
          () =>
            rosaenlgPug.render(
              `
p
  | il #[+verb(getAnonMS(), {verb: 'toto', tense:'FUTUR'} )]
  | "#{chanson.nom}"
  | de #{chanson.auteur}
`,
              {
                language: 'fr_FR',
                compileDebug: true,
              },
            ),
          (err) => checkErr(err, 'NotFoundInDict', 3, 'toto'),
        );
      });

      it('null in value', function () {
        assert.throws(
          () =>
            rosaenlgPug.render(
              `
| bla bla
| #[+value(xxx)]
`,
              {
                language: 'en_US',
                compileDebug: true,
              },
            ),
          (err) => checkErr(err, 'InvalidArgumentError', 3, 'first parameter of value is null or undefined'),
        );
      });

      it('invalid eachz', function () {
        assert.throws(
          () =>
            rosaenlgPug.render(
              `
eachz elt in ['A', 'B'] with { toto tata }
  | #{elt}
`,
              {
                language: 'en_US',
                compileDebug: true,
              },
            ),
          (err) => checkErr(err, 'Error', 2, 'Unexpected token'),
        );
      });
    });

    it('ordinal number too high', function () {
      assert.throws(
        () =>
          rosaenlgPug.render(`| #[+value(1000, {'ORDINAL_TEXTUAL':true })]`, {
            language: 'fr_FR',
            compileDebug: true,
          }),
        (err) => checkErr(err, 'RangeError', 1, 'French ordinal'),
      );
    });

    it('should have traces when activated', function () {
      const compiled = rosaenlgPug.compileClient(templateChanson, {
        language: 'fr_FR',
        chanson: {
          auteur: 'Édith Piaf',
          nom: 'Non, je ne regrette rien',
        },
        compileDebug: true,
      });
      assert(compiled.indexOf(';debug(') !== -1, compiled);
    });

    it('should not have traces when not activated', function () {
      const compiled = rosaenlgPug.compileClient(templateChanson, {
        language: 'fr_FR',
        chanson: {
          auteur: 'Édith Piaf',
          nom: 'Non, je ne regrette rien',
        },
        compileDebug: false,
      });
      assert(compiled.indexOf(';debug(') === -1, compiled);
    });
  });
});
