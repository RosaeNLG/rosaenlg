/**
 * @license
 * Copyright 2021 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const path = require('path');
const puppeteer = require('puppeteer');

console.log('are we in CI?', process.env.CI);
if (process.env.CI == 'true' || process.env.CI == true) {
  console.log('we are in github CI, this test does not work => going out');
  return;
}

before(async function () {
  global.browser = await puppeteer.launch({
    headless: true,
    slowMo: 100,
    timeout: 20000,
  });
});

after(function () {
  browser.close();
});

const testCases = {
  en_US: ['Apples', 'ate', 'An industry', 'Tomatoes'],
  fr_FR: ['et pêches.', 'chanteront', 'belles plages'],
  de_DE: ['Äpfel', 'und Birnen'],
  es_ES: ['Hubiera sido. Unas luces. Los grandes árboles blancos y beige.'],
  it_IT: ['Deliziose torte'],
  OTHER: ['Ik hou van appels'],
};

describe('rosaenlg-browser-poc', function () {
  this.timeout(20000);

  Object.keys(testCases).forEach(function (lang) {
    describe(`test ${lang}`, function () {
      let page;

      before(async function () {
        page = await browser.newPage();
        const filename = path.join(__dirname, `../dist/browser_${lang}.html`);
        await page.goto('file:' + filename);
      });

      after(async function () {
        await page.close();
      });

      it(`rendered should be ok`, async function () {
        rendered = await page.$eval('textarea', (elt) => elt.value);

        console.log('rendered', rendered, testCases[lang]);

        for (expected of testCases[lang]) {
          assert(rendered.indexOf(expected) > -1, `${rendered} does not contain ${expected}`);
        }
      });
    });
  });
});
