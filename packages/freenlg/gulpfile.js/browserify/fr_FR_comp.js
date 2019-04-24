const version = '__VERSION__';

// just to get the correct brfs job properly done
let dummyFrenchHMuetAspire = require('../../../french-h-muet-aspire/dist');
let dummyFrenchWords = require('../../../french-words-gender/dist');
let dummyFrenchVerbs = require('../../../french-verbs/dist');

// to have the pre compiled main.pug included
let dummyCodeGen = require('../../../freenlg-pug-code-gen/dist');

let freenlg = require('../../dist/index.js');

module.exports = {
  // NlgLib: require('../../dist/NlgLib').NlgLib, <= is not required as index.js already uses NlgLib
  render: freenlg.render,
  version
};

