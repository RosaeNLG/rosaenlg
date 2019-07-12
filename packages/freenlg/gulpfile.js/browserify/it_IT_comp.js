const version = '__VERSION__';

// just to get the correct brfs job properly done
let dummyItalianWords = require('../../../italian-words/dist'); // eslint-disable-line
let dummyItalianVerbs = require('../../../italian-verbs/dist'); // eslint-disable-line
let dummyItalianAdjectives = require('../../../italian-adjectives/dist'); // eslint-disable-line

// to have the pre compiled main.pug included
let dummyCodeGen = require('../../../freenlg-pug-code-gen/dist'); // eslint-disable-line

let freenlg = require('../../dist/index.js');

module.exports = {
  render: freenlg.render,
  version,
};
