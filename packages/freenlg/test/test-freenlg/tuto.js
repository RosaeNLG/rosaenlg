var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

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

const testCases = [
  {lang:'en_US', vals:['OnePlus', 'available', 'Black, Red and White']},
  {lang:'de_DE', vals: ['physischen', 'Akku']},
  {lang:'fr_FR', vals:['écran', 'batterie']}
]

function renderTuto(lang) {
  var res = '';
  for (var i=0; i<phones.length; i++) {
    res += 
      freenlgPug.renderFile(`doc/tuto_${lang}.pug`, {
        language: lang,
        phone: phones[i]
      });
  }
  return res;
}

describe('freenlg', function() {
  describe('tuto', function() {

    testCases.forEach(function(testCase) {

      var rendered = renderTuto(testCase.lang);
      var words = testCase.vals;

      for (var i=0; i<words.length; i++) {

        var posOfWord = rendered.indexOf(words[i]);
        it(`${testCase.lang}: ${words[i]}`, function() {
          assert( posOfWord>-1 )
        });
      }
    });
  
  });
});

