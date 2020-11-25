/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const GermanVerbsLib = require('./dist/index.js');
const GermanVerbsDict = require('german-verbs-dict');

// hörten
console.log(GermanVerbsLib.getConjugation(GermanVerbsDict, 'hören', 'PRATERITUM', 3, 'P'));

// werden gehabt haben
console.log(GermanVerbsLib.getConjugation(GermanVerbsDict, 'haben', 'FUTUR2', 3, 'P', 'HABEN'));
