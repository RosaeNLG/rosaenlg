/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const { processGermanAdjectives } = require('./dist/create/createList');
const { series } = require('gulp');

function createAdjectives(cb) {
  processGermanAdjectives('resources/dictionary.dump', 'dist/adjectives.json', cb);
}

function copyLicences(cb) {
  fs.copyFileSync('./resources/LICENSE.txt', './dist/LICENSE.txt');
  fs.copyFileSync('./resources/README.md', './dist/README.md');
  cb();
}

exports.build = series(createAdjectives, copyLicences);
