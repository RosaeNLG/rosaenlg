var junit = require("junit");
const pug = require('freenlg-pug');
const NlgLib = require('../index').NlgLib;
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
  var nlgLib = new NlgLib({language: 'en_US'});
  var res = '';
  for (var i=0; i<phones.length; i++) {

    nlgLib = new NlgLib(nlgLib);

    res = res + nlgLib.filter(
      pug.renderFile('test/test_tuto.pug', {
        util: nlgLib,
        phone: phones[i]
      })
    );
  }

  var words = ['OnePlus', 'available', 'Black, Red and White'];
  for (var i=0; i<words.length; i++) {
    it('test tuto: ' + words[i], () => it.eq( res.indexOf( words[i] )>-1 , true));
  }

  //console.log( res );

}
