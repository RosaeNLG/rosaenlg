/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const determiners = require('./dist/index.js');

// el
console.log(determiners.getDet('DEFINITE', 'M', 'S', 'hombre', null));

// el
console.log(determiners.getDet('DEFINITE', 'F', 'S', 'agua', null));

// aquella
console.log(determiners.getDet('DEMONSTRATIVE', 'F', 'S', null, 'DISTAL'));
