<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# french-determiners

A simple Node.js module that contains French determiners.

For instance _le_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes as arguments:

* determiner type (string, mandatory): `DEFINITE` `INDEFINITE` `DEMONSTRATIVE` or `POSSESSIVE`
* gender of the object (string, mandatory): `M` for masculine, `F` for feminine
* number of the object (string, mandatory): `S` for singular, `P` for plural
* number of the owner of the object (mandatory when `POSSESSIVE`, put null otherwise): `S` or `P`
* when `INDEFINITE` plural followed by an adjective:
** optional boolean indicating if there is an adjective after the determiner (used to manage `de bons restaurants`)
** optional string containing the content of what is after (used to manage exception `des jeunes gens`)
** optional boolean indicatif to force `des`, even when `de` should be output

## Installation 
```sh
npm install french-determiners
```

## Usage

```javascript
var determiners = require('french-determiners');

// le
console.log(determiners.getDet('DEFINITE', 'F', 'S', null, null, null, null));

// ses
console.log(determiners.getDet('POSSESSIVE', 'M', 'P', 'S', null, null, null));
```

See `test.js` for examples.

## dependencies and licences

no dependency
