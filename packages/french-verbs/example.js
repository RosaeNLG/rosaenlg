/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const FrenchVerbs = require('./dist/index.js');
const Lefff = require('french-verbs-lefff/dist/conjugations.json');

// elle est allée
console.log(
  'elle ' + FrenchVerbs.getConjugation(Lefff, 'aller', 'PASSE_COMPOSE', 2, { aux: 'ETRE', agreeGender: 'F' }),
);

// je finis
console.log('je ' + FrenchVerbs.getConjugation(Lefff, 'finir', 'PRESENT', 0));
