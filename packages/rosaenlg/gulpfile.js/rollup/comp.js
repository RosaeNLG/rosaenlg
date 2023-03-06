/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const rosaenlg = require('../../dist/index.js');
const rosaenlgLib = require('rosaenlg-lib');

module.exports = {
  render: rosaenlg.render,
  compile: rosaenlg.compile,
  compileFile: rosaenlg.compileFile,
  compileClient: rosaenlg.compileClient,
  compileFileClient: rosaenlg.compileFileClient,
  renderFile: rosaenlg.renderFile,
  NlgLib: rosaenlgLib.NlgLib, // to have the ability to run pre compiled js templates
  getRosaeNlgVersion: rosaenlgLib.getRosaeNlgVersion,
};

exports.render = rosaenlg.render;
exports.compile = rosaenlg.compile;
exports.compileFile = rosaenlg.compileFile;
exports.compileClient = rosaenlg.compileClient;
exports.compileFileClient = rosaenlg.compileFileClient;
exports.renderFile = rosaenlg.renderFile;
exports.NlgLib = rosaenlgLib.NlgLib;
exports.getRosaeNlgVersion = rosaenlgLib.getRosaeNlgVersion;
