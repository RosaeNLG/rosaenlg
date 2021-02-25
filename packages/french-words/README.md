<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# french-words

Gender of French words: _autoroute_ is feminine, _déjeuner_ is masculine, etc. Use `french-words-gender-lefff` to add real linguistic resources.

Wrapper over `rosaenlg-pluralize-fr` to get plurals.

## Installation 
```sh
npm install french-words
```

## Usage

```javascript
const FrenchWordsLib = require('french-words');
const FrenchWordsLefff = require('french-words-gender-lefff');

// M
console.log(FrenchWordsLib.getGender(null, FrenchWordsLefff, 'déjeuner'));

// F
console.log(FrenchWordsLib.getGender(null, FrenchWordsLefff, 'Console'));

// genoux
console.log(FrenchWordsLib.getPlural(null, 'genou'));

```

`getGender`, with the following parameters:

* embedded word list: map where key is the word, and has a gender key: `{'bague': { gender: 'F' }}`
* OR word list typically `french-words-gender-lefff` (`{'bague':'F', 'blablabla':'F', ...}`)
* word at its root form (will find _autoroute_ but not _autoroutes_)

Case matters: DEA, DESS, DEUG etc.

`getNumber`, with the following parameters:

* embedded word list: map where key is the word, and has a plural key: `{'bague': { plural: 'bagues' }}`; will use `rosaenlg-pluralize-fr` if not provided
* word at its root form
