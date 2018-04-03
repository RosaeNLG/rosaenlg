// tag::require[]
const pug = require('pug');
const NlgLib = require('freenlg').NlgLib;
// end::require[]

// tag::data[]
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
// end::data[]

// tag::mainLoop[]
var nlgLib = new NlgLib({language: 'en_US'});
for (var i=0; i<phones.length; i++) {

  nlgLib = new NlgLib(nlgLib);

  var res = nlgLib.filter(
    pug.renderFile('tuto.pug', {
      util: nlgLib,
      phone: phones[i]
    })
  );
  console.log( res );

}
// end::mainLoop[]

