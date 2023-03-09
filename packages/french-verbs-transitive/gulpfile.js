/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const { generateTransitiveList } = require('./dist/create/createTransitive');
const { amendTransitiveList } = require('./dist/create/amendTransitive');
const { series } = require('gulp');

function createTransitive(cb) {
  generateTransitiveList('resources/transitive.json', cb);
}

function amendList(cb) {
  amendTransitiveList('resources/transitive.json', cb);
}

exports.fromweb = series(createTransitive);
exports.amend = series(amendList);
