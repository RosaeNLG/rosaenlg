/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const { processGermanVerbs } = require('./dist/create/createList');
const { series } = require('gulp');

function createVerbs(cb) {
  processGermanVerbs('resources/dictionary.dump', 'dist/verbs.json', cb);
}

function copyLicences(cb) {
  fs.copyFileSync('./resources/LICENSE.txt', './dist/LICENSE.txt');
  fs.copyFileSync('./resources/README.md', './dist/README.md');
  fs.copyFileSync('./resources/wklassen.pdf', './dist/wklassen.pdf');
  cb();
}

exports.build = series(createVerbs, copyLicences);
