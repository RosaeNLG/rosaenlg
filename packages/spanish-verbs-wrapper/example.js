/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const SpanishVerbsWrapper = require('./dist/index.js');

// habla
console.log(SpanishVerbsWrapper.getConjugation(null, 'hablar', 'INDICATIVE_PRESENT', 2));

console.log(SpanishVerbsWrapper.getVerbInfo('hablar'));
