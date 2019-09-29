const version = '__VERSION__';

// just to get the correct brfs job properly done
let dummyGermanWords = require('../../../german-words/dist'); // eslint-disable-line
let dummyGermanVerbs = require('../../../german-verbs/dist'); // eslint-disable-line
let dummyGermanAdjectives = require('../../../german-adjectives/dist'); // eslint-disable-line

// to have the pre compiled main.pug included
let dummyCodeGen = require('../../../rosaenlg-pug-code-gen/dist'); // eslint-disable-line

const rosaenlg = require('../../dist/index.js');

module.exports = {
  render: rosaenlg.render,
  version,
};
