/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const { processItalianWords } = require('./dist/create/createList');
const { series } = require('gulp');

function createWords(cb) {
  processItalianWords('resources/morph-it_048.txt', 'dist/words.json', cb);
}

function copyLicences(cb) {
  fs.copyFileSync('./resources/lgpl.txt', './dist/lgpl.txt');
  fs.copyFileSync('./resources/readme-morph-it.txt', './dist/readme-morph-it.txt');
  cb();
}

exports.build = series(createWords, copyLicences);
