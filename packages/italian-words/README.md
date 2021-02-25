<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# italian-words

Provides information on Italian words:

* Gender of Italian words, : _cameriera_ is feminine, _cameriere_ is masculine, etc.
* Number declination of words: the plural of _cameriera_ is _cameriere_.

Use `italian-words-dict` as linguistic resource.

## Installation 
```sh
npm install italian-words
```

## Usage

```javascript
const ItalianWords = require('italian-words');
const ItalianWordsList = require('italian-words-dict');

// F
console.log(ItalianWords.getGenderItalianWord(null, ItalianWordsList, 'cameriera'));

// libri
console.log(ItalianWords.getNumberItalianWord(null, ItalianWordsList, 'libro', 'P'));

// arance
console.log(ItalianWords.getNumberItalianWord(null, ItalianWordsList, 'arancia', 'P'));
```

`getGenderItalianWord` returns the gender M or F based on:

* a list of exception words that overrides default list (put `null` in general)
* a list of words: see `italian-words-dict`
* a string param which is the word at its root form

`getNumberItalianWord` returns the declined word based on:

* a list of exception words that overrides default list (put `null` in general)
* a list of words: see `italian-words-dict`
* string param which is the word at its root form
* string param which is the number (S or P)

Both throw an error when the word is not found.

