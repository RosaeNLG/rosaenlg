# french-determiners

A simple Node.js module that contains French determiners.

For instance _le_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determiner type (string, mandatory): `DEFINITE` `INDEFINITE` `DEMONSTRATIVE` or `POSSESSIVE`
* gender of the object (string, mandatory): `M` for masculine, `F` for feminine
* number of the object (string, mandatory): `S` for singular, `P` for plural
* number of the owner of the object (mandatory when `POSSESSIVE`, put null otherwise): `S` or `P`

## Installation 
```sh
npm install french-determiners
```

## Usage

```javascript
var determiners = require('french-determiners');

// le
console.log( determiners.getDet('DEFINITE', 'F', 'S', null) );

// ses
console.log( determiners.getDet('POSSESSIVE', 'M', 'P', 'S') );
```

See `test.js` for examples.

## dependencies and licences

no dependency
