const rosaenlg = require('../../dist/index.js');
const nlgLib = require('../../dist/NlgLib');

module.exports = {
  render: rosaenlg.render,
  compile: rosaenlg.compile,
  compileFile: rosaenlg.compileFile,
  compileClient: rosaenlg.compileClient,
  compileFileClient: rosaenlg.compileFileClient,
  render: rosaenlg.render,
  renderFile: rosaenlg.renderFile,
  NlgLib: nlgLib.NlgLib, // to have the ability to run pre compiled js templates
  getRosaeNlgVersion: nlgLib.getRosaeNlgVersion,
};
