/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const determiners = require('./dist/index.js');

// la
console.log(determiners.getDet({ detType: 'DEFINITE', genderOwned: 'F', numberOwned: 'S' }));

// ses
console.log(
  determiners.getDet({ detType: 'POSSESSIVE', genderOwned: 'M', numberOwned: 'P', numberOwner: 'S', personOwner: 3 }),
);
