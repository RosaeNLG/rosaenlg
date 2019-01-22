var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();

var phones = [
  {
    name: 'OnePlus 5T',
    colors: ['Black', 'Red', 'White'],
    displaySize: 6,
    screenRatio: 80.43,
    battery: 3300,
    bluetooh: 5
  },
  {
    name: 'OnePlus 5',
    colors: ['Gold', 'Gray'],
    displaySize: 5.5,
    screenRatio: 72.93,
    battery: 3300,
    bluetooh: 5
  },
  {
    name: 'OnePlus 3T',
    colors: ['Black', 'Gold', 'Gray'],
    displaySize: 5.5,
    screenRatio: 73.15,
    battery: 3400,
    bluetooh: 4.2
  }
];

module.exports = it => {

  const langs = {
    'en_US': ['OnePlus', 'available', 'Black, Red and White'],
    'de_DE': ['physischen', 'Akku'],
    'fr_FR': ['téléphone', 'écran', 'batterie']
  }

  for (var lang in langs) {

    var res = '';
    for (var i=0; i<phones.length; i++) {
      res = res + 
        freenlgPug.renderFile(`../freenlg-core/doc/tuto_${lang}.pug`, {
          language: lang,
          phone: phones[i]
        });
    }
    // console.log(res);
  
    var words = langs[lang];
    for (var i=0; i<words.length; i++) {
      it(`test tuto ${lang}: ${words[i]}`, () => it.eq( res.indexOf( words[i] )>-1 , true));
    }
  
  }

}
