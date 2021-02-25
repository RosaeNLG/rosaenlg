<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# italian-determiners

A simple Node.js module that manages Italian determiners.

For instance _il_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determiner type (string, mandatory): `DEFINITE` `INDEFINITE` `DEMONSTRATIVE`
* gender (string, mandatory): `M` for masculine, `F` for feminine
* number (string, mandatory): `S` for singular, `P` for plural
* dist when `DEMONSTRATIVE`: `NEAR` (default) or `FAR`

It manages only the most simple form of determiners: for instance DEFINITE M P is always _i_, never _gli_. Transforming _i_ into _gli_ (and all other cases) is managed by `rosaenlg-filter`.

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

// questa
console.log(determiners.getDet('DEMONSTRATIVE', 'F', 'S', 'NEAR'));
```

See `test.js` for examples.

## dependencies and licences

no dependency
