/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const { processEnglishGerunds } = require('./dist/create/createList');
const { series } = require('gulp');

function createGerunds(cb) {
  processEnglishGerunds('resources/verb.exc', 'dist/gerunds.json', cb);
}

function copyLicences(cb) {
  fs.copyFileSync('./resources/WORDNET_LICENCE', './dist/WORDNET_LICENCE');
  cb();
}

exports.build = series(createGerunds, copyLicences);
