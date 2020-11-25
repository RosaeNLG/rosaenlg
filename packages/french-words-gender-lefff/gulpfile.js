/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const { processFrenchWords } = require('./dist/create/createList');
const { series } = require('gulp');

function createWords(cb) {
  processFrenchWords('resources/lefff-3.4.mlex', 'dist/words.json', cb);
}

function copyLicences(cb) {
  fs.copyFileSync('./resources/LICENSE', './dist/LICENSE');
  cb();
}

exports.build = series(createWords, copyLicences);
