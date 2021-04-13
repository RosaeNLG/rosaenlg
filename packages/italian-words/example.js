/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const ItalianWords = require('./dist/index.js');
const ItalianWordsList = require('italian-words-dict/dist/words.json');

// F
console.log(ItalianWords.getGenderItalianWord(null, ItalianWordsList, 'cameriera'));

// libri
console.log(ItalianWords.getNumberItalianWord(null, ItalianWordsList, 'libro', 'P'));

// arance
console.log(ItalianWords.getNumberItalianWord(null, ItalianWordsList, 'arancia', 'P'));
