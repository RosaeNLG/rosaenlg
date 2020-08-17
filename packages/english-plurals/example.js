const EnglishPlurals = require('./dist/index.js');
const Irregular = require('english-plurals-list');

// women
console.log(EnglishPlurals.getPlural(null, Irregular, 'woman'));
