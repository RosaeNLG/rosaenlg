/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const EnglishPlurals = require('./dist/index.js');
const Irregular = require('english-plurals-list/dist/plurals.json');

// women
console.log(EnglishPlurals.getPlural(null, Irregular, 'woman'));
