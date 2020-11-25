/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


const determiners = require('./dist/index.js');

// le
console.log(determiners.getDet('DEFINITE', 'F', 'S', null));

// ses
console.log(determiners.getDet('POSSESSIVE', 'M', 'P', 'S'));
