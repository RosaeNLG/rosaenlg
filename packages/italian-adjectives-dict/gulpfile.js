/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const { processItalianAdjectives } = require('./dist/create/createList');
const { series } = require('gulp');

function createAdjectives(cb) {
  processItalianAdjectives('resources/morph-it_048.txt', 'dist/adjectives.json', cb);
}

function copyLicences(cb) {
  fs.copyFileSync('./resources/lgpl.txt', './dist/lgpl.txt');
  fs.copyFileSync('./resources/readme-morph-it.txt', './dist/readme-morph-it.txt');
  cb();
}

exports.build = series(createAdjectives, copyLicences);
