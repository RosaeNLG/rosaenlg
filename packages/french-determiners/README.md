# french-determiners

A simple Node.js module that contains French adjectives.

For instance _le_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determiner type (string, mandatory): DEFINITE INDEFINITE DEMONSTRATIVE or POSSESSIVE
* gender (string, mandatory): `M` for masculine, `F` for feminine
* number (string, mandatory): `S` for singular, `P` for plural

## Installation 
```sh
npm install french-determiners
```

## Usage

```javascript
var determiners = require('french-determiners');

// le
console.log( determiners.getDet('DEFINITE', 'F', 'S') );

// ces
console.log( determiners.getDet('DEMONSTRATIVE', 'M', 'P') );
```

See `test.js` for examples.

## Dependancies and licences

no dependancy
