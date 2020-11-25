/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const determiners = require('./dist/index.js');

// the
console.log(determiners.getDet('DEFINITE', null, null, 'S', null, null));

// those
console.log(determiners.getDet('DEMONSTRATIVE', null, null, 'P', 'FAR', null));

// their
console.log(determiners.getDet('POSSESSIVE', null, 'P', 'S', null, null));
