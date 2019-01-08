var junit = require("junit");
const freenlgPug = require('../lib/index.js');
var tutoData = require('./tutoData');

var it = junit();

var phones = tutoData.phones;

module.exports = it => {

  const langs = {
    //'en_US': ['OnePlus', 'available', 'Black, Red and White'],
    //'de_DE': ['Gurke', 'physischen', 'Handy'],
    'fr_FR': []
  }

  for (var lang in langs) {

    var res = '';
    for (var i=0; i<phones.length; i++) {
      res = res + 
        freenlgPug.renderFile(`test-freenlg/test_tuto_${lang}.pug`, {
          language: lang,
          phone: phones[i]
        });
    }
    console.log(res);
  
    var words = langs[lang];
    for (var i=0; i<words.length; i++) {
      it(`test tuto ${lang}: ${words[i]}`, () => it.eq( res.indexOf( words[i] )>-1 , true));
    }
  
  }

}
