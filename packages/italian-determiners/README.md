# italian-determiners

A simple Node.js module that manages Italian determiners.

For instance _il_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determiner type (string, mandatory): `DEFINITE` `INDEFINITE`
* gender (string, mandatory): `M` for masculine, `F` for feminine
* number (string, mandatory): `S` for singular, `P` for plural

It manages only the most simple form of determiners: for instance DEFINITE M P is always _i_, never _gli_. Transforming _i_ into _gli_ (and all other cases) is managed by `freenlg-filter`.

## Installation 
```sh
npm install italian-determiners
```

## Usage

```javascript
var determiners = require('italian-determiners');

// il
console.log(determiners.getDet('DEFINITE', 'M', 'S'));

// una
console.log(determiners.getDet('INDEFINITE', 'F', 'S'));
```

See `test.js` for examples.

## Dependancies and licences

no dependancy
