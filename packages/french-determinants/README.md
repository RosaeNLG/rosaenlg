# french-determinants

A simple Node.js module that contains French adjectives.

For instance _le_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determinant type (string, mandatory): DEFINITE INDEFINITE or DEMONSTRATIVE
* gender (string, mandatory): `M` for masculine, `F` for feminine
* number (string, mandatory): `S` for singular, `P` for plural

## Installation 
```sh
npm install french-determinants
```

## Usage

```javascript
var determinants = require('french-determinants');

// le
console.log( determinants.getDet('DEFINITE', 'F', 'S') );

// ces
console.log( determinants.getDet('DEMONSTRATIVE', 'M', 'P') );
```

See `test.js` for examples.

## Dependancies and licences

no dependancy
