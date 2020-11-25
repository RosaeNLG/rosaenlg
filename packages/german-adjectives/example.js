/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const GermanAdjectivesLib = require('./dist/index.js');
const GermanAdjectives = require('german-adjectives-dict');

// neuen
console.log(GermanAdjectivesLib.agreeGermanAdjective(null, GermanAdjectives, 'neu', 'DATIVE', 'M', 'S', 'DEFINITE'));
