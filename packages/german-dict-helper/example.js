/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const GermanDictHelper = require('./dist/index.js').GermanDictHelper;

const gdh = new GermanDictHelper();

// Frühstück
console.log(gdh.getNoun('Frühstücken'));

// schön
console.log(gdh.getAdj('schöner'));
