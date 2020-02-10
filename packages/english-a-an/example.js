const englishAAn = require('./dist/index.js');
const englishAAnList = require('english-a-an-list');

// an
console.log(englishAAn.getAAn(englishAAnList, 'English'));

// a
console.log(englishAAn.getAAn(englishAAnList, 'European'));
