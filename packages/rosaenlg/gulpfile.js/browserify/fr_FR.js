const version = '__VERSION__';

// just to get the correct brfs job properly done
let dummyFrenchHMuetAspire = require('../../../french-h-muet-aspire/dist'); // eslint-disable-line

/*
let dummyFrenchWords = require('../../french-words-gender/dist');
let dummyFrenchVerbs = require('../../french-verbs/dist');
*/

module.exports = {
  NlgLib: require('../../dist/NlgLib').NlgLib,
  version,
};
