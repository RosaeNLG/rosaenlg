<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# german-determiners

A simple Node.js module that contains German determiners. For instance _der_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 6 arguments:

* determiner type (string, mandatory): `DEFINITE` `INDEFINITE` `DEMONSTRATIVE` or `POSSESSIVE`
* case (string, mandatory): `NOMINATIVE` `ACCUSATIVE` `DATIVE` or `GENITIVE`
* when type is `POSSESSIVE`, info about the *owner* (for other det types put null)
  * gender: `M` `F` or `N`
  * number: `S` or `P`
* info about the *owned* (mandatory):
  * gender: `M` `F` or `N`
  * number: `S` or `P`

## Installation 
```sh
npm install german-determiners
```

## Usage

```javascript
var determiners = require('german-determiners');

// der
console.log( determiners.getDet('DEFINITE', 'NOMINATIVE', null, null, 'M', 'S') );

// dieser
console.log( determiners.getDet('DEMONSTRATIVE', 'GENITIVE', null, null, 'M', 'P') );

// seines
console.log( determiners.getDet('POSSESSIVE', 'GENITIVE', 'N', 'S', 'M', 'S') );
```

See `test.js` for examples.

## dependencies and licences

no dependency
