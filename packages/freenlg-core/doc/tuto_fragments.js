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

// tag::mainLoop_fr_FR[]
for (var i=0; i<phones.length; i++) {

  var res = freenlgPug.renderFile('tuto.pug', {
      language: 'fr_FR',
      phone: phones[i],
      cache: true
  });
  console.log( res );

}
// end::mainLoop_fr_FR[]

// tag::mainLoop_en_US[]
for (var i=0; i<phones.length; i++) {

  var res = freenlgPug.renderFile('tuto.pug', {
      language: 'en_US',
      phone: phones[i],
      cache: true
  });
  console.log( res );

}
// end::mainLoop_en_US[]

// tag::mainLoop_de_DE[]
for (var i=0; i<phones.length; i++) {

  var res = freenlgPug.renderFile('tuto.pug', {
      language: 'de_DE',
      phone: phones[i],
      cache: true
  });
  console.log( res );

}
// end::mainLoop_de_DE[]

