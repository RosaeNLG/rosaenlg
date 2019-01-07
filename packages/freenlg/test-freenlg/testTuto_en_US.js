var junit = require("junit");
const freenlgPug = require('../lib/index.js');
var tutoData = require('./tutoData');

var it = junit();

var phones = tutoData.phones;

module.exports = it => {

  var res = '';
  for (var i=0; i<phones.length; i++) {

    res = res + 
      freenlgPug.renderFile('test-freenlg/test_tuto.pug', {
        language: 'en_US',
        phone: phones[i]
      });
  }

  var words = ['OnePlus', 'available', 'Black, Red and White'];
  for (var i=0; i<words.length; i++) {
    it('test tuto: ' + words[i], () => it.eq( res.indexOf( words[i] )>-1 , true));
  }

  // console.log( res );

}
