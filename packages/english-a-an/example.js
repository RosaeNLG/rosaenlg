/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const englishAAn = require('./dist/index.js');
const englishAAnList = require('english-a-an-list');

// an
console.log(englishAAn.getAAn(null, englishAAnList, 'English'));

// a
console.log(englishAAn.getAAn(null, englishAAnList, 'European'));
