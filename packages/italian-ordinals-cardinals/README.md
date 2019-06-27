# italian-ordinals-cardinals

A very simple Node.js module that gives textual representations of numbers in Italian:

* cardinal numbers: 12 => _dodici_ (up to 30)
* ordinal numbers: 12 => _dodicesimo_ (up to 100)


## Installation 
```sh
npm install italian-ordinals-cardinals
```

## Usage

```javascript
var ordinalsCardinals = require('italian-ordinals-cardinals');

// dodicesimo
console.log(`12 => ${ordinalsCardinals.getOrdinal(12)}`);

// dodici
console.log(`12 => ${ordinalsCardinals.getCardinal(12)}`);
```

## Todo

make it dynamic for larger numbers


## Dependancies

N/A
