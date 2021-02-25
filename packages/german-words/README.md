<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# German Words

Provides information on German words:

* Gender of German words, : _Korpus_ is neutral, _Friede_ is masculine, etc.
* Case declination of words: the genitive of _Herr_ is _Herren_.

Use `german-words-dict` as the linguistic resource.

## Installation 
```sh
npm install german-words
```

## Usage

```javascript
const GermanWords = require('german-words');
const GermanWordsList = require('german-words-dict');

// F
console.log(GermanWords.getGenderGermanWord(null, GermanWordsList, 'Gurke'));

// Herren
console.log(GermanWords.getCaseGermanWord(null, GermanWordsList, 'Herr', 'GENITIVE', 'S'));

// Gurken
console.log(GermanWords.getCaseGermanWord(null, GermanWordsList, 'Gurke', 'NOMINATIVE', 'P'));
```

`getGenderGermanWord` returns the gender M F or N, based on:

* a exception linguistic resource (put `null` in general, only use it to override standard linguistic resource)
* a linguistic resource (see `german-words-dict`)
* the word at its root form

`getCaseGermanWord` returns the declined word based on:

* a linguistic resource (see `german-words-dict`)
* first string param which is the word at its root form
* second string param which is the case (NOMINATIVE ACCUSATIVE DATIVE GENITIVE)
* third string param which is the number (S or P)


Both throw an error when the word is not found.

