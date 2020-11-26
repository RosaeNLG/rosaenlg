/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const { series } = require('gulp');

const workflows = require('./workflows');
const release = require('./release');

exports.workflows = workflows.all;
exports.release_patch = series(release.patch, workflows.all);
exports.release_minor = series(release.minor, workflows.all);
exports.release_major = series(release.major, workflows.all);
