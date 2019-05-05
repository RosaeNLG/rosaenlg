const version = '__VERSION__';

// to have the pre compiled main.pug included
let dummyCodeGen = require('../../../freenlg-pug-code-gen/dist'); // eslint-disable-line

let freenlg = require('../../dist/index.js');

module.exports = {
  render: freenlg.render,
  version,
};
