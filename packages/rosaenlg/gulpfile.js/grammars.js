/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const { src, dest } = require('gulp');
const pegjs = require('gulp-pegjs');

/*
  use relative paths as we call this file directly using --gulpfile
*/
function grammars() {
  return src('../src/grammars/*.pegjs')
    .pipe(pegjs({ format: 'commonjs' }))
    .pipe(dest('../dist'));
}

exports.all = grammars;
