/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const determiners = require('./dist/index.js');

// il
console.log(determiners.getDet('DEFINITE', 'M', 'S'));

// una
console.log(determiners.getDet('INDEFINITE', 'F', 'S'));

// questa
console.log(determiners.getDet('DEMONSTRATIVE', 'F', 'S', 'NEAR'));
