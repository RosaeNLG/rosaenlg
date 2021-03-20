/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const ordinals = require('./dist/index.js');

// première
console.log(`1 F => ${ordinals.getOrdinal(1, 'F')}`);

// douzième
console.log(`12 => ${ordinals.getOrdinal(12)}`);

