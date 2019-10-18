const version = '__VERSION__';

// just to get the correct brfs job properly done

// DE
let dummyGermanWords = require('../../../german-words/dist'); // eslint-disable-line
let dummyGermanVerbs = require('../../../german-verbs/dist'); // eslint-disable-line
let dummyGermanAdjectives = require('../../../german-adjectives/dist'); // eslint-disable-line

// FR
let dummyFrenchHMuetAspire = require('../../../french-h-muet-aspire/dist'); // eslint-disable-line
let dummyFrenchWords = require('../../../french-words-gender/dist'); // eslint-disable-line
let dummyFrenchVerbs = require('../../../french-verbs/dist'); // eslint-disable-line

// IT
let dummyItalianWords = require('../../../italian-words/dist'); // eslint-disable-line
let dummyItalianVerbs = require('../../../italian-verbs/dist'); // eslint-disable-line
let dummyItalianAdjectives = require('../../../italian-adjectives/dist'); // eslint-disable-line

// to have the pre compiled main.pug included
let dummyCodeGen = require('../../../rosaenlg-pug-code-gen/dist'); // eslint-disable-line

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
  version,
};
