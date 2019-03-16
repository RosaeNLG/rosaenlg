# german-words

Provides information on German words:

* Gender of German words, : _Korpus_ is neutral, _Friede_ is masculine, etc.
* Case declination of words: the genitive of _Herr_ is _Herren_.

It is based on the [german-pos-dict](https://github.com/languagetool-org/german-pos-dict) which provides an extensive morphological and syntactic lexicon for German.


## Installation 
```sh
npm install german-words
```

## Usage

```javascript
var GermanWords = require('german-words');

// F
console.log( GermanWords.getGenderGermanWord('Gurke') );

// Herren
console.log( GermanWords.getCaseGermanWord('Herr', 'GENITIVE', 'S') );

// Gurken
console.log( GermanWords.getCaseGermanWord('Gurke', 'NOMINATIVE', 'P') );
```

* `getGenderGermanWord` takes a single string param which is the word at its root form and returns the gender M F or N.
* `getCaseGermanWord` returns the declined word based on:
** first string param which is the word at its root form
** second string param which is the case (NOMINATIVE ACCUSATIVE DATIVE GENITIVE)
** third string param which is the number (S or P)

Both throw an error when the word is not found.

## Dependancies and licences

[german-pos-dict](https://github.com/languagetool-org/german-pos-dict) provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org. `dictionary.dump` is this textual dump. It remains under CC-BY-SA-4.0 licence.
