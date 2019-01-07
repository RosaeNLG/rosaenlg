var junit = require("junit");
const freenlgPug = require('../lib/index.js');
var tutoData = require('./tutoData');

var it = junit();

var phones = tutoData.phones;

module.exports = it => {

  var res = '';
  for (var i=0; i<phones.length; i++) {

    res = res + 
      freenlgPug.renderFile('test-freenlg/test_tuto_German.pug', {
        language: 'de_DE',
        phone: phones[i]
      });
  }

  console.log( res );

}
