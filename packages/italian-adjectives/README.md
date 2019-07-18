# italian-adjectives

Agreement of Italian adjectives, based on the gender and number of the word.

It is based on [morph-it](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) which provides an extensive  morphological resource for the Italian language.

Manages irregular adjectives (_bello_ _buono_ _grande_ _santo_) when placed before the noun.


## Installation 
```sh
npm install italian-adjectives
```

## Usage

```javascript
var ItalianAdjectives = require('italian-adjectives');

// azzurre
console.log(ItalianAdjectives.agreeItalianAdjective('azzurro', 'F', 'P'));

// Sant'
console.log(ItalianAdjectives.agreeItalianAdjective('Santo', 'F', 'S', 'Anna', true));
```

One main function `agreeitalianAdjective` that takes multiple parameters and return the agreed adjective:

* `adjective`: the adjective to agree; it must be the lemma, not the agreed form (i.e. _azzurro_ not _azzurre_); when participe put the masculine singular (`educato` MP => _educati_)
* `gender` gender of the word; `M` `F` or `N`
* `number`: number of the word; `S` or `P`
* `noun`: if `isBeforeNoun` is `true` _and_ the adjective is irregular, you must indicate the noun
* `isBeforeNoun`: put `true` if the adjective is meant to be placed before the noun; default is `false`
* optional adj data to enrich the standard adjective list with specific adjectives, also overrides the standard list entries; key value format (for instance `{'antico': ...}`); for the the format of the value see the output of `getAdjectiveInfo`, it must be the same.

`getAdjectiveInfo` to get raw data about an adjective.

Possessive articles (`mio` `tio` etc.) are supported (and you do not need to put `isBeforeNoun` to true).

## Dependancies and licences

[morph-it](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) provides an extensive  morphological resource for the Italian language. It is dual-licensed free software and can be redistributed it and/or modified  under the terms of the under the Creative Commons Attribution ShareAlike 2.0 License and the GNU Lesser General Public License.
The derived file `adjectives.json` remains under the same licence.
