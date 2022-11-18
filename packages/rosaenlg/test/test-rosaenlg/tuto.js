/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const phones = [
  {
    name: 'OnePlus 5T',
    colors: ['Black', 'Red', 'White'],
    displaySize: 6,
    screenRatio: 80.43,
    battery: 3300,
  },
  {
    name: 'OnePlus 5',
    colors: ['Gold', 'Gray'],
    displaySize: 5.5,
    screenRatio: 72.93,
    battery: 3300,
  },
  {
    name: 'OnePlus 3T',
    colors: ['Black', 'Gold', 'Gray'],
    displaySize: 5.5,
    screenRatio: 73.15,
    battery: 3400,
  },
];

const testCases = [
  { lang: 'en_US', vals: ['OnePlus', 'available', 'Black, Red and White'] },
  { lang: 'de_DE', vals: ['physischen', 'Akku'] },
  { lang: 'fr_FR', vals: ['écran', 'batterie'] },
];

describe('rosaenlg', function () {
  describe('tuto', function () {
    testCases.forEach(function (testCase) {
      const rendered = rosaenlgPug.renderFile(
        `../rosaenlg-doc/doc/modules/tutorials/partials/tuto_${testCase.lang}.pug`,
        {
          language: testCase.lang,
          phones: phones,
        },
      );

      const words = testCase.vals;

      words.forEach(function (word) {
        const posOfWord = rendered.indexOf(word);
        it(`${testCase.lang}: ${word}`, function () {
          assert(posOfWord > -1);
        });
      });
    });
  });
});
