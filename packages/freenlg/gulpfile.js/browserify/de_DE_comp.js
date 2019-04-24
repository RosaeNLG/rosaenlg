const version = '__VERSION__';

// just to get the correct brfs job properly done
let dummyGermanWords = require('../../../german-words/dist');
let dummyGermanVerbs = require('../../../german-verbs/dist');
let dummyGermanAdjectives = require('../../../german-adjectives/dist');

// to have the pre compiled main.pug included
let dummyCodeGen = require('../../../freenlg-pug-code-gen/dist');

let freenlg = require('../../dist/index.js');

module.exports = {
  render: freenlg.render,
  version
};
