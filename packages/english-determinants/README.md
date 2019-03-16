# english-determinants

A simple Node.js module that contains English adjectives.

For instance _the_ is the definite article for singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determinant type (string, mandatory): DEFINITE INDEFINITE or DEMONSTRATIVE
* number (string, mandatory): `S` for singular, `P` for plural
* distance (string, optional, only used for DEMONSTRATIVE): `NEAR` (_this these_) or `FAR` (_that those_)

## Installation 
```sh
npm install english-determinants
```

## Usage

```javascript
var determinants = require('english-determinants');

// the
console.log( determinants.getDet('DEFINITE', 'S', null) );

// those
console.log( determinants.getDet('DEMONSTRATIVE', 'P', 'FAR') );
```

See `test.js` for examples.

## Dependancies and licences

no dependancy
