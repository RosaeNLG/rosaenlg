// tag::require[]
const rosaenlgPug = require('rosaenlg');
// end::require[]

// tag::data[]
let phones = [
  {
    name: 'OnePlus 5T',
    colors: ['Black', 'Red', 'White'],
    displaySize: 6,
    screenRatio: 80.43,
    battery: 3300,
  },
  {
    name: 'OnePlus 5',
    colors: ['Gold', 'Gray'],
    displaySize: 5.5,
    screenRatio: 72.93,
    battery: 3300,
  },
  {
    name: 'OnePlus 3T',
    colors: ['Black', 'Gold', 'Gray'],
    displaySize: 5.5,
    screenRatio: 73.15,
    battery: 3400,
  },
];
// end::data[]

// tag::mainLoop[]
const res = rosaenlgPug.renderFile('tuto.pug', {
  language: '{rosaenlg_lang}',
  phones: phones,
  cache: true,
});
console.log(res);
// end::mainLoop[]
