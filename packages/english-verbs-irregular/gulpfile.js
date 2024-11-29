/**
 * @license
 * Copyright 2024 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const { processEnglishVerbsIrregular } = require('./dist/create/createList');
const { series } = require('gulp');

function createEnglishVerbsIrregular(cb) {
  processEnglishVerbsIrregular('dist/verbs.json', cb);
}

exports.build = series(createEnglishVerbsIrregular);
