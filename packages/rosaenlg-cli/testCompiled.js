/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

/*
used as a manual test:
1. generate the js file
node dist/index.js -l en_US sandbox/fruits.pug --client

2. render it using this script
*/

const fs = require('fs');
const NlgLib = require('rosaenlg').NlgLib;

const compiled = fs.readFileSync('sandbox/fruits.js', 'utf8');
const compiledFct = new Function('params', `${compiled}; return template(params);`);

const rendered = compiledFct({
  util: new NlgLib({ language: 'en_US' }),
});

console.log(rendered);
