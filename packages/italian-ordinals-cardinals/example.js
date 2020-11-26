/**
 * @license
 * Copyright 2020, Marco Riva, 2019, Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const ordinalsCardinals = require('./dist/index.js');

// dodicesimo
console.log(`12 => ${ordinalsCardinals.getOrdinal(12)}`);
// novecentonovantanovemilanovecentonovantanovesimo
console.log(`999999 => ${ordinalsCardinals.getOrdinal(999999)}`);
// milionesimo
console.log(`1000000 => ${ordinalsCardinals.getOrdinal(1000000)}`);
