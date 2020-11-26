/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const lib = require('./dist/index.js');

// hérisson contracts? false
// homme contracts? true
// yaourt contracts? false
// iode contracts? true
['hérisson', 'homme', 'yaourt', 'iode'].forEach((word) => {
  console.log(`${word} contracts? ${lib.contracts(word, null)}`);
});
