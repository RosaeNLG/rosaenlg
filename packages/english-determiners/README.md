# english-determiners

A simple Node.js module that contains English adjectives.

For instance _the_ is the definite article for singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determiner type (string, mandatory): DEFINITE INDEFINITE DEMONSTRATIVE or POSSESSIVE
* gender (string, mandatory when POSSESSIVE): `M` `F` or `N`
* number (string, mandatory): `S` for singular, `P` for plural
* distance (string, optional, only used for DEMONSTRATIVE): `NEAR` (_this these_) or `FAR` (_that those_)

## Installation 
```sh
npm install english-determiners
```

## Usage

```javascript
var determiners = require('english-determiners');

// the
console.log( determiners.getDet('DEFINITE', 'S', null) );

// those
console.log( determiners.getDet('DEMONSTRATIVE', 'P', 'FAR') );
```

See `test.js` for examples.

## Dependancies and licences

no dependancy
