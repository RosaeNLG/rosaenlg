/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const GermanVerbsDict = require('./dist/verbs.json');

console.log(GermanVerbsDict['hören']);
console.log(JSON.stringify(GermanVerbsDict['mitnehmen'], null, 2));
