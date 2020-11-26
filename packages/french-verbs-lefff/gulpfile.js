/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const { processFrenchVerbs } = require('./dist/create/createList');
const { series } = require('gulp');

function createVerbs(cb) {
  processFrenchVerbs('./resources/lefff-3.4.mlex', 'dist/conjugations.json', cb);
}

function copyLicences(cb) {
  fs.copyFileSync('./resources/LICENSE', './dist/LICENSE');
  cb();
}

exports.build = series(createVerbs, copyLicences);
