/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const MorphItHelper = require('./dist/index.js').MorphItHelper;

const mih = new MorphItHelper();

// uomo
console.log(mih.getNoun('uomini'));

// antico
console.log(mih.getAdj('antiche'));
