/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const rosaenlg = require('../../dist/index.js');
const nlgLib = require('../../dist/NlgLib');

module.exports = {
  render: rosaenlg.render,
  compile: rosaenlg.compile,
  compileFile: rosaenlg.compileFile,
  compileClient: rosaenlg.compileClient,
  compileFileClient: rosaenlg.compileFileClient,
  renderFile: rosaenlg.renderFile,
  NlgLib: nlgLib.NlgLib, // to have the ability to run pre compiled js templates
  getRosaeNlgVersion: nlgLib.getRosaeNlgVersion,
};

exports.render = rosaenlg.render;
exports.compile = rosaenlg.compile;
exports.compileFile = rosaenlg.compileFile;
exports.compileClient = rosaenlg.compileClient;
exports.compileFileClient = rosaenlg.compileFileClient;
exports.renderFile = rosaenlg.renderFile;
exports.NlgLib = nlgLib.NlgLib;
exports.getRosaeNlgVersion = nlgLib.getRosaeNlgVersion;
