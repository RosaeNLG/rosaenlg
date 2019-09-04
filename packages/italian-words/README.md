# italian-words

Provides information on Italian words:

* Gender of Italian words, : _cameriera_ is feminine, _cameriere_ is masculine, etc.
* Number declination of words: the plural of _cameriera_ is _cameriere_.

It is based on [morph-it](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) which provides an extensive  morphological resource for the Italian language.

## Installation 
```sh
npm install italian-words
```

## Usage

```javascript
var ItalianWords = require('italian-words');

// F
console.log(ItalianWords.getGenderItalianWord('cameriera'));

// libri
console.log(ItalianWords.getNumberItalianWord('libro', 'P'));

// arance
console.log(ItalianWords.getNumberItalianWord('arancia', 'P'));
```

`getGenderItalianWord` takes a single string param which is the word at its root form and returns the gender M or F.

`getNumberItalianWord` returns the declined word based on:

* first string param which is the word at its root form
* second string param which is the number (S or P)

They take an optional second parameter: a list of word data, which completes the original list (and overrides when there are collisions); for format see the output of `getWordInfo`.

Both throw an error when the word is not found.


## Dependancies and licences

[morph-it](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) provides an extensive  morphological resource for the Italian language. It is dual-licensed free software and can be redistributed it and/or modified  under the terms of the under the Creative Commons Attribution ShareAlike 2.0 License and the GNU Lesser General Public License.
The derived file `adjectives.json` remains under the same licence.
