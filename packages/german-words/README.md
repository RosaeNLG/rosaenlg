# german-words

Provides information on German words:

* Gender of German words, : _Korpus_ is neutral, _Friede_ is masculine, etc.
* Case declination of words: the genitive of _Herr_ is _Herren_.

It is based on the german-pos-dict: https://github.com/languagetool-org/german-pos-dict which provides an extensive morphological and syntactic lexicon for German.


## Licence info

https://github.com/languagetool-org/german-pos-dict provides linguistic binary resources under CC-BY-SA-4.0, which autorises commercial usages. It also contains an `export.sh` script to generate a textual dump using https://github.com/languagetool-org.
`dictionary.dump` is this textual dump. It remains under CC-BY-SA-4.0 licence.

The derived database included in this package remains under the same CC-BY-SA-4.0 licence.


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
console.log( GermanWords.getCaseGermanWord('Herr', 'GENITIVE') );
```

* `getGenderGermanWord` takes a single string param which is the word at its root form and returns the gender M F or N.
* `getCaseGermanWord` takes a string param which is the word at its root form, a second param which is the case (NOMINATIVE ACCUSATIVE DATIVE GENITIVE) and returns the declined word.


## Dependancies

.Dependancies
[options="header"]
|=====================================================================
| Resource | Usage | Licence
| https://github.com/languagetool-org/german-pos-dict | database content | CC-BY-SA-4.0
|=====================================================================
