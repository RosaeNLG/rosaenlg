/**
 * @license
 * Copyright 2022 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');
const NlgLib = require('../../dist/NlgLib').NlgLib;

const templateHasSaid = `
mixin bla
  if !hasSaid('BLA')
    | blabla
    recordSaid('BLA')
  else
    | other

+bla
`;

const templateRefExpr = `
- var PRODUCT = {};
mixin PRODUCT_ref(obj, params)
  | the ring
- PRODUCT.ref = PRODUCT_ref;

mixin PRODUCT_refexpr(obj, params)
  synz {mode: 'once'}
    syn
      | this jewel
    syn
      | it
- PRODUCT.refexpr = PRODUCT_refexpr

+value(PRODUCT)
`;

const templateSynzOnce = `
synz {mode: 'once'}
  syn
    | A
  syn
    | B
  syn
    | C
`;

const templateSynzSeq = `
synz {mode: 'sequence'}
  syn
    | A
  syn
    | B
  syn
    | C
`;

const templateCurrentGender = `
- var PRODUIT = {};

mixin produit_ref(obj, params)
  | la Bague Diamants
  - setRefGender(PRODUIT, 'F');
- PRODUIT.ref = produit_ref;

mixin produit_refexpr(obj, params)
  synz {mode: 'sequence'}
    syn
      | cette bague
      - setRefGender(PRODUIT, 'F');
    syn
      | cet anneau
      - setRefGender(PRODUIT, 'M');
    syn
      | ce bijou
      - setRefGender(PRODUIT, 'M');
- PRODUIT.refexpr = produit_refexpr;

+subjectVerbAdj(PRODUIT, 'être', 'beau')
`;

describe('misc', function () {
  it(`has said`, function () {
    const compiled = rosaenlgPug.compile(templateHasSaid, {
      language: 'en_US',
    });

    const options1 = {
      util: new NlgLib({
        language: 'en_US',
      }),
    };
    const rendered1 = compiled(options1);
    assert.strictEqual(rendered1, 'Blabla');

    const rendered2 = compiled(options1);
    assert.strictEqual(rendered2, 'Other');

    const rendered3 = compiled(options1);
    assert.strictEqual(rendered3, 'Other');
  });
  it(`refexpr`, function () {
    const compiled = rosaenlgPug.compile(templateRefExpr, {
      language: 'en_US',
    });

    const options1 = {
      util: new NlgLib({
        language: 'en_US',
        forceRandomSeed: 42,
      }),
    };
    const rendered1 = compiled(options1);
    assert.strictEqual(rendered1, 'The ring');

    for (let i = 0; i < 5; i++) {
      const renderedNext = compiled(options1);
      assert(renderedNext === 'It' || renderedNext === 'This jewel');
    }
  });
  it(`synz once`, function () {
    const compiled = rosaenlgPug.compile(templateSynzOnce, {
      language: 'en_US',
    });

    const options1 = {
      util: new NlgLib({
        language: 'en_US',
        forceRandomSeed: 42,
      }),
    };
    const rendered1 = compiled(options1);
    assert.strictEqual(rendered1, 'A');

    const rendered2 = compiled(options1);
    assert(rendered2 === 'B' || renderedNext === 'C');

    const rendered3 = compiled(options1);
    assert(rendered3 !== 'A' && rendered3 !== rendered2);

    const rendered4 = compiled(options1);
    assert.strictEqual(rendered4, 'A');
  });
  it(`synz sequence`, function () {
    const compiled = rosaenlgPug.compile(templateSynzSeq, {
      language: 'en_US',
    });

    const options1 = {
      util: new NlgLib({
        language: 'en_US',
        forceRandomSeed: 42,
      }),
    };
    const rendered1 = compiled(options1);
    assert.strictEqual(rendered1, 'A');

    const rendered2 = compiled(options1);
    assert.strictEqual(rendered2, 'B');

    const rendered3 = compiled(options1);
    assert.strictEqual(rendered3, 'C');

    const rendered4 = compiled(options1);
    assert.strictEqual(rendered4, 'A');
  });
  it(`random number`, function () {
    const compiled = rosaenlgPug.compile(templateSynzOnce, {
      language: 'en_US',
    });

    const options1 = {
      util: new NlgLib({
        language: 'en_US',
        forceRandomSeed: 42,
      }),
    };
    compiled(options1);
    assert.strictEqual(options1.util.saveRollbackManager.randomManager.rndNextPos, 1);

    compiled(options1);
    assert.strictEqual(options1.util.saveRollbackManager.randomManager.rndNextPos, 2);

    compiled(options1);
    assert.strictEqual(options1.util.saveRollbackManager.randomManager.rndNextPos, 3);
  });

  it(`refexpr with gender`, function () {
    const compiled = rosaenlgPug.compile(templateCurrentGender, {
      language: 'fr_FR',
    });

    const options1 = {
      util: new NlgLib({
        language: 'fr_FR',
        forceRandomSeed: 42,
      }),
    };

    const rendered1 = compiled(options1);
    assert.strictEqual(rendered1, 'La Bague Diamants est belle');

    const rendered2 = compiled(options1);
    assert.strictEqual(rendered2, 'Cette bague est belle');

    const rendered3 = compiled(options1);
    assert.strictEqual(rendered3, 'Cet anneau est beau');

    const rendered4 = compiled(options1);
    assert.strictEqual(rendered4, 'Ce bijou est beau');

    const rendered6 = compiled(options1);
    assert.strictEqual(rendered6, 'Cette bague est belle');
  });
});
