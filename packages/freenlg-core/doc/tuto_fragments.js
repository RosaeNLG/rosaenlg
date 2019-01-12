// tag::require[]
const freenlgPug = require('freenlg');
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
for (var i=0; i<phones.length; i++) {

  var res = freenlgPug.renderFile('tuto.pug', {
      language: '{freenlg_lang}',
      phone: phones[i],
      cache: true
  });
  console.log( res );

}
// end::mainLoop[]

