<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# english-determiners

A simple Node.js module that contains English determiners.

For instance _the_ is the definite article for singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determiner type (string, mandatory): `DEFINITE` `INDEFINITE` `DEMONSTRATIVE` or `POSSESSIVE`
* when `POSSESSIVE`:
  * gender of the *owner* (string): `M` `F` or `N`
  * number of the *owner* (string): `S` or `P`
* number of the *owned* (string): `S` or `P`
* distance (string, optional, only used for `DEMONSTRATIVE`): `NEAR` (_this these_) or `FAR` (_that those_)
* boolean to force usage of _the_ when `DEFINITE` plural (default is false: no article when definite plural)

## Installation 
```sh
npm install english-determiners
```

## Usage

```javascript
var determiners = require('english-determiners');

// the
console.log( determiners.getDet('DEFINITE', null, null, 'S', null) );

// those
console.log( determiners.getDet('DEMONSTRATIVE', null, null, 'P', 'FAR') );

// their
console.log( determiners.getDet('POSSESSIVE', null, 'P', 'S', null) );
```

See `test.js` for examples.

## dependencies

no dependency
