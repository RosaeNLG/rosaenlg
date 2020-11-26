/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const { src, dest } = require('gulp');
const replace = require('gulp-replace');
const version = require('../package.json').version;

// See http://mdn.io/string.replace#Specifying_a_string_as_a_parameter

function forIndexJs() {
  return src(['../lib/index.js'])
    .pipe(replace(/PLACEHOLDER_ROSAENLG_VERSION/, version))
    .pipe(dest('../dist/'));
}

function forNlgLib() {
  return src(['../dist/NlgLib.js'])
    .pipe(replace(/PLACEHOLDER_ROSAENLG_VERSION/, version))
    .pipe(dest('../dist/'));
}

exports.forIndexJs = forIndexJs;
exports.forNlgLib = forNlgLib;
