/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const EnglishVerbs = require('./dist/index.js');
const Irregular = require('english-verbs-irregular/dist/verbs.json');
const Gerunds = require('english-verbs-gerunds/dist/gerunds.json');

const VerbsData = EnglishVerbs.mergeVerbsData(Irregular, Gerunds);

// (he/she) eats
console.log(EnglishVerbs.getConjugation(null, 'eat', 'PRESENT', 2));

// (he/she) ate
console.log(EnglishVerbs.getConjugation(VerbsData, 'eat', 'SIMPLE_PAST', 2));

// swimming
console.log(EnglishVerbs.getIngPart(VerbsData, 'swim'));
