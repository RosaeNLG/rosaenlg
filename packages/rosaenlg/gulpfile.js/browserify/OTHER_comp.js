const version = '__VERSION__';

// to have the pre compiled main.pug included
let dummyCodeGen = require('../../../rosaenlg-pug-code-gen/dist'); // eslint-disable-line

const rosaenlg = require('../../dist/index.js');

module.exports = {
  render: rosaenlg.render,
  version,
};
