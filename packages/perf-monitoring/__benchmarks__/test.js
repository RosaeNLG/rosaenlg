/**
 * @license
 * Copyright 2020 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const rosaenlg = require('rosaenlg');
const NlgLib = require('rosaenlg').NlgLib;
const fs = require('fs');

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

// we only have these languages as tuto
const languages = ['en_US', 'fr_FR', 'de_DE'];

// cache
const templates = {};
const compileds = {};
for (let i = 0; i < languages.length; i++) {
  const language = languages[i];

  // do it once - this is not what we want to test when we compile
  templates[language] = fs.readFileSync(`tuto_${language}.pug`, 'utf-8');

  // do it once - this is not what we want to test when we render
  compileds[language] = rosaenlg.compileFile(`tuto_${language}.pug`, {
    language: language,
    compileDebug: false,
  });
}

// iter: de_DE and fr_FR tutos use simplified syntax, while en_US does not (and is much faster)

function justCompile(language, iter) {
  for (let i = 0; i < iter; i++) {
    rosaenlg.compile(templates[language], {
      language: language,
      compileDebug: true,
    });
  }
}

function justRender(language, iter) {
  for (let i = 0; i < iter; i++) {
    compileds[language]({
      phones: phones,
      util: new NlgLib({ language: language }),
    });
  }
}

function renderFile(language, iter) {
  for (let i = 0; i < iter; i++) {
    rosaenlg.renderFile(`tuto_${language}.pug`, {
      phones: phones,
      language: language,
      cache: false,
      compileDebug: true,
    });
  }
}

suite('rosaenlg performance testing', () => {
  scenario('just compile en_US', () => {
    justCompile('en_US', 200);
  });
  scenario('just render en_US', () => {
    justRender('en_US', 200);
  });
  scenario('render file en_US', () => {
    renderFile('en_US', 200);
  });
  scenario('just compile fr_FR', () => {
    justCompile('fr_FR', 20);
  });
  scenario('just render fr_FR', () => {
    justRender('fr_FR', 20);
  });
  scenario('render file fr_FR', () => {
    renderFile('fr_FR', 20);
  });
  scenario('just compile de_DE', () => {
    justCompile('de_DE', 20);
  });
  scenario('just render de_DE', () => {
    justRender('de_DE', 20);
  });
  scenario('render file de_DE', () => {
    renderFile('de_DE', 20);
  });
});
