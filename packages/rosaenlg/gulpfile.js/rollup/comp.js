const rosaenlg = require('../../dist/index.js');

module.exports = {
  render: rosaenlg.render,
  compile: rosaenlg.compile,
  compileFile: rosaenlg.compileFile,
  compileClient: rosaenlg.compileClient,
  compileFileClient: rosaenlg.compileFileClient,
  render: rosaenlg.render,
  renderFile: rosaenlg.renderFile,
  NlgLib: require('../../dist/NlgLib').NlgLib, // to have the ability to run pre compiled js templates
};
