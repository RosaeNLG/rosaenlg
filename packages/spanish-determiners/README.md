<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# spanish-determiners

A simple Node.js module that contains Spanish determiners.

For instance _el_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes 3 arguments:

* determiner type (string, mandatory): `DEFINITE` `INDEFINITE` `DEMONSTRATIVE` or `POSSESSIVE`
* gender of the object (string, mandatory): `M` for masculine, `F` for feminine
* number of the object (string, mandatory): `S` for singular, `P` for plural
* the word (noun or adjective) that will come after the determiner; it is used only when type is 
`DEFINITE` or `INDEFINITE` to manage feminine `el` case (`el agua`)
* the type of distance, when `DEMONSTRATIVE`: `PROXIMAL`, `MEDIAL` or `DISTAL`, `PROXIMAL` is the default

`POSSESSIVE` only works for 3rd person S or P (generates `su` or `sus`, depending of the possessed object, not the possessor), thus information about the owner is not required.

## Installation 
```sh
npm install spanish-determiners
```

## Usage

```javascript
const determiners = require('spanish-determiners');

// el
console.log(determiners.getDet('DEFINITE', 'M', 'S', 'hombre', null));

// el
console.log(determiners.getDet('DEFINITE', 'F', 'S', 'agua', null));

// aquella
console.log(determiners.getDet('DEMONSTRATIVE', 'F', 'S', null, 'DISTAL'));
```

See `test.js` for examples.

