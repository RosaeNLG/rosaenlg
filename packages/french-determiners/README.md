<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# french-determiners

A simple Node.js module that contains French determiners.

For instance _le_ is the definite article for masculine singular.

It exposes a single function, `getDet`, that takes as argument an object of type:
```
{
  detType: DetType;
  genderOwned: Genders;
  numberOwned: Numbers;
  numberOwner?: Numbers;
  personOwner?: Persons;
  adjectiveAfterDet?: boolean;
  contentAfterDet?: string;
  forceDes?: boolean;
}
```
where

* detType: determiner type (string, mandatory): `DEFINITE` `INDEFINITE` `DEMONSTRATIVE` or `POSSESSIVE`
* genderOwned: gender of the object (string, mandatory): `M` for masculine, `F` for feminine
* numberOwned: number of the object (string, mandatory): `S` for singular, `P` for plural
* numberOwner: number of the owner of the object (mandatory when `POSSESSIVE`, put null otherwise): `S` or `P`
* personOwner: person of the owner of the object (mandatory when `POSSESSIVE`, put null otherwise): 1, 2 or 3
* when `INDEFINITE` plural followed by an adjective:
** adjectiveAfterDet: optional boolean indicating if there is an adjective after the determiner (used to manage `de bons restaurants`)
** contentAfterDet: optional string containing the content of what is after (used to manage exception `des jeunes gens`)
** forceDes: optional boolean indicatif to force `des`, even when `de` should be output

## Installation 
```sh
npm install french-determiners
```

## Usage

```javascript
var determiners = require('french-determiners');

// la
console.log(determiners.getDet({ detType: 'DEFINITE', genderOwned: 'F', numberOwned: 'S' }));

// ses
console.log(
  determiners.getDet({ detType: 'POSSESSIVE', genderOwned: 'M', numberOwned: 'P', numberOwner: 'S', personOwner: 3 }),
);
```

See `test.js` for examples.

## dependencies and licences

no dependency
