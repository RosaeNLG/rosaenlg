/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const ItalianAdjectives = require('./dist/index.js');
const ItalianAdjectivesList = require('italian-adjectives-dict');

// azzurre
console.log(ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'azzurro', 'F', 'P'));

// Sant'
console.log(ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'Santo', 'F', 'S', 'Anna', true));
