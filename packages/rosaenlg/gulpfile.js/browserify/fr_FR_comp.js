const version = '__VERSION__';

// just to get the correct brfs job properly done
let dummyFrenchHMuetAspire = require('../../../french-h-muet-aspire/dist'); // eslint-disable-line
let dummyFrenchWords = require('../../../french-words-gender/dist'); // eslint-disable-line
let dummyFrenchVerbs = require('../../../french-verbs/dist'); // eslint-disable-line

// to have the pre compiled main.pug included
const dummyCodeGen = require('../../../rosaenlg-pug-code-gen/dist');

const rosaenlg = require('../../dist/index.js');

module.exports = {
  // NlgLib: require('../../dist/NlgLib').NlgLib, <= is not required as index.js already uses NlgLib
  render: rosaenlg.render,
  version,
};
