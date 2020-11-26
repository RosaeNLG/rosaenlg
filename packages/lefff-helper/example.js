/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const LefffHelper = require('./dist/index.js').LefffHelper;

const lh = new LefffHelper();

// oeil
console.log(lh.getNoun('yeux'));

// beau
console.log(lh.getAdj('bel'));
